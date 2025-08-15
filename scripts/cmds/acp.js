const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "accept",
    aliases: ["acp"],
    version: "1.0",
    author: "eran",
    countDown: 10,
    role: 2,
    shortDescription: "✅ Accept or ❌ Delete friend requests",
    longDescription: "Accept or delete pending friend requests with emoji notifications",
    category: "Utility",
  },

  onReply: async function ({ message, Reply, event, api, commandName }) {
    const { author, listRequest, messageID } = Reply;
    if (author !== event.senderID) return;

    clearTimeout(Reply.unsendTimeout);

    const args = event.body.trim().toLowerCase().split(" ");
    if (!["add", "del"].includes(args[0])) {
      return api.sendMessage("⚠️ Please select: <add | del> <number | all>", event.threadID, event.messageID);
    }

    const action = args[0]; // 'add' or 'del'
    const targetIDs = args[1] === "all" ? listRequest.map((_, idx) => idx + 1) : args.slice(1);

    const form = {
      av: api.getCurrentUserID(),
      fb_api_caller_class: "RelayModern",
      fb_api_req_friendly_name: action === "add"
        ? "FriendingCometFriendRequestConfirmMutation"
        : "FriendingCometFriendRequestDeleteMutation",
      doc_id: action === "add" ? "3147613905362928" : "4108254489275063",
      variables: {
        input: {
          source: "friends_tab",
          actor_id: api.getCurrentUserID(),
          client_mutation_id: Math.random().toString(36).slice(2, 15),
        },
        scale: 3,
        refresh_num: 0
      }
    };

    const success = [];
    const failed = [];
    const promiseRequests = [];

    // Loop through all targets
    for (const stt of targetIDs) {
      const index = parseInt(stt) - 1;
      const user = listRequest[index];

      if (!user) {
        failed.push(`❌ Can't find target ${stt}`);
        continue;
      }

      form.variables.input.friend_requester_id = user.node.id;
      promiseRequests.push(api.httpPost("https://www.facebook.com/api/graphql/", {
        ...form,
        variables: JSON.stringify(form.variables)
      }));

      success.push({ name: user.node.name, id: user.node.id });
    }

    const finalSuccess = [];
    const finalFailed = [];

    for (let i = 0; i < promiseRequests.length; i++) {
      try {
        const res = await promiseRequests[i];
        const data = JSON.parse(res);
        if (data.errors) finalFailed.push(`❌ ${success[i].name}`);
        else finalSuccess.push(`✅ ${success[i].name}`);
      } catch {
        finalFailed.push(`❌ ${success[i].name}`);
      }
    }

    // Build the result message
    let resultMsg = "";
    if (finalSuccess.length) {
      resultMsg += `🎉 ${action === "add" ? "Accepted" : "Deleted"}: ${finalSuccess.length} user(s)\n${finalSuccess.join("\n")}`;
    }
    if (finalFailed.length) {
      resultMsg += `\n⚠️ Failed: ${finalFailed.length} user(s)\n${finalFailed.join("\n")}`;
    }
    if (!resultMsg) resultMsg = "ℹ️ No users were processed.";

    api.unsendMessage(messageID);
    return api.sendMessage(resultMsg, event.threadID);
  },

  onStart: async function ({ event, api, commandName }) {
    const form = {
      av: api.getCurrentUserID(),
      fb_api_req_friendly_name: "FriendingCometFriendRequestsRootQueryRelayPreloader",
      fb_api_caller_class: "RelayModern",
      doc_id: "4499164963466303",
      variables: JSON.stringify({ input: { scale: 3 } })
    };

    try {
      const response = await api.httpPost("https://www.facebook.com/api/graphql/", form);
      const listRequest = JSON.parse(response)?.data?.viewer?.friending_possibilities?.edges || [];

      if (!listRequest.length) return api.sendMessage("ℹ️ No pending friend requests found.", event.threadID);

      // Build the message with emoji formatting
      const msg = listRequest.map((user, i) =>
        `🔹 ${i + 1}. ${user.node.name}\n🆔 ID: ${user.node.id}\n🌐 URL: ${user.node.url.replace("www.facebook", "fb")}\n⏰ Time: ${moment().tz("Asia/Manila").format("DD/MM/YYYY HH:mm:ss")}`
      ).join("\n\n");

      api.sendMessage(
        `${msg}\n\n✍️ Reply with: <add | del> <number | all> to process requests`,
        event.threadID,
        (err, info) => {
          global.GoatBot.onReply.set(info.messageID, {
            commandName,
            messageID: info.messageID,
            listRequest,
            author: event.senderID,
            unsendTimeout: setTimeout(() => api.unsendMessage(info.messageID), this.config.countDown * 1000)
          });
        },
        event.messageID
      );
    } catch (error) {
      console.error(error);
      api.sendMessage("⚠️ Error retrieving friend request list.", event.threadID);
    }
  }
};
