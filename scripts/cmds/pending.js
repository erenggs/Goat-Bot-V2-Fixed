const axios = require("axios");
const fs = require("fs");

module.exports = {
  config: {
    name: "pending",
    aliases: ["pen", "pend", "pe"],
    version: "1.8.0",
    author: "eran",
    countDown: 10,
    role: 1,
    shortDescription: "Manage pending requests",
    longDescription: "Approve or reject pending users or group requests quickly",
    category: "utility",
  },

  onReply: async function ({ message, api, event, Reply }) {
    const { author, pending, messageID } = Reply;
    if (String(event.senderID) !== String(author)) return;

    const { body, threadID } = event;
    const input = body.trim().toLowerCase();

    // Cancel operation
    if (input === "c") {
      try {
        await api.unsendMessage(messageID);
        return api.sendMessage("❌ Operation canceled. No changes were made.", threadID);
      } catch (err) {
        console.error(err);
        return;
      }
    }

    const indexes = body.split(/\s+/).map(Number);
    if (indexes.some(isNaN)) {
      return api.sendMessage("⚠ Invalid input! Please reply using valid number(s). 📝", threadID);
    }

    let approvedCount = 0;

    // Approve selected pending items
    for (const idx of indexes) {
      if (idx <= 0 || idx > pending.length) continue;
      const group = pending[idx - 1];

      try {
        // Send approval message to the group/user
        await api.sendMessage(
          `✅ Approved: "${group.name || "Unknown"}"! 🎉\nYou can now access bot commands! ✨`,
          group.threadID
        );

        // Change bot nickname in group
        await api.changeNickname(
          global.GoatBot.config.nickNameBot || "🌊ʸᵒᵘʳ Cʜᴏᴄᴏʟᴀᴛᴇ🍭",
          group.threadID,
          api.getCurrentUserID()
        );

        approvedCount++;
      } catch (err) {
        console.error(`❌ Failed to approve group/user: ${group.threadID}`, err);
      }
    }

    // Remove approved items from pending list (reverse order to avoid index shift)
    for (const idx of indexes.sort((a, b) => b - a)) {
      if (idx > 0 && idx <= pending.length) pending.splice(idx - 1, 1);
    }

    return api.sendMessage(
      `🎊 Operation complete! Approved ${approvedCount} group(s)/user(s). ✅`,
      threadID
    );
  },

  onStart: async function ({ api, event, args, usersData }) {
    const { threadID, messageID, senderID } = event;
    const adminBot = global.GoatBot.config.adminBot;

    if (!adminBot.includes(senderID)) {
      return api.sendMessage("⚠ You are not authorized to use this command! 🔒", threadID);
    }

    const type = args[0]?.toLowerCase();
    if (!type || !["user", "thread", "all"].some(t => type.startsWith(t))) {
      return api.sendMessage("ℹ Usage: pending [user/thread/all] 📋", threadID);
    }

    try {
      // Fetch pending & other threads from API
      const [spamList, pendingList] = await Promise.all([
        api.getThreadList(100, null, ["OTHER"]),
        api.getThreadList(100, null, ["PENDING"])
      ]);
      const list = [...(spamList || []), ...(pendingList || [])];

      // Filter list based on type
      let filteredList = [];
      if (type.startsWith("u")) filteredList = list.filter(t => !t.isGroup);
      if (type.startsWith("t")) filteredList = list.filter(t => t.isGroup);
      if (type === "all") filteredList = list;

      if (filteredList.length === 0) {
        return api.sendMessage("ℹ No pending groups or users found. 🕵️‍♂️", threadID);
      }

      // Build message for pending list
      let msg = "";
      for (let i = 0; i < filteredList.length; i++) {
        const name = filteredList[i].name || (await usersData.getName(filteredList[i].threadID)) || "Unknown";
        msg += `📌 [ ${i + 1} ] ${name}\n`;
      }
      msg += `\n🦋 Reply with number(s) of group/user to approve.\n❌ Reply with "c" to cancel.`;

      // Send list and register reply handler
      return api.sendMessage(
        `✨ [ Pending ${type.charAt(0).toUpperCase() + type.slice(1)} List ] ✨\n\n${msg}`,
        threadID,
        (error, info) => {
          global.GoatBot.onReply.set(info.messageID, {
            commandName: this.config.name,
            messageID: info.messageID,
            author: senderID,
            pending: filteredList,
          });
        },
        messageID
      );

    } catch (err) {
      console.error(err);
      return api.sendMessage("⚠ Failed to fetch pending list. Please try again later. 🔄", threadID);
    }
  },
};
