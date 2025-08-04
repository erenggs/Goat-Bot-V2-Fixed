const fs = require('fs').promises;
const path = require('path');
const { getStreamsFromAttachment } = global.utils;
const { config } = global.GoatBot;
const { client } = global;
const mediaTypes = ["photo", "png", "animated_image", "video", "neymar", "pain", "Nsfw", "hgen", "hot", "sexy", "audio"];

module.exports = {
  config: {
    name: "vip",
    version: "1.0",
    author: "eran",
    countDown: 5,
    role: 0,
    shortDescription: { en: "🎖 Manage VIP users" },
    longDescription: { en: "🎖 Add/remove/list VIP members and enable VIP-only messaging mode" },
    category: "admin",
    guide: {
      en: `🎖 VIP Command Guide:
{p}vip ➤ Send message to all VIPs
{p}vip add <uid> ➤ Add user to VIP
{p}vip remove <uid> ➤ Remove VIP user
{p}vip list ➤ Show VIP list
{p}vip on/off ➤ Toggle VIP-only mode`
    }
  },

  langs: {
    en: {
      missingMessage: "🚫 You must be a VIP member to use this feature.",
      sendByGroup: "\n🏘️ Group: %1\n🆔 Thread ID: %2",
      sendByUser: "\n🙍 Sent from user",
      content: "\n📝 Message:\n%1",
      success: "✅ Message delivered to VIP Admin!\n%2",
      failed: "❌ Failed to send message to VIP Admin.\n%2\nCheck console for details.",
      reply: "📨 Reply from VIP Admin (%1):\n%2",
      replySuccess: "✅ Reply sent to VIP Admin successfully!",
      feedback: "📬 Feedback from VIP user %1:\n🆔 ID: %2\n%3\n📝 Message:\n%4",
      replyUserSuccess: "✅ Reply sent to VIP user!",
      noAdmin: "🚫 You don’t have permission to use this command!",
      addSuccess: "✅ User has been added to the VIP list!",
      alreadyInVIP: "⚠️ User is already in the VIP list!",
      removeSuccess: "✅ User has been removed from the VIP list!",
      notInVIP: "⚠️ User is not in the VIP list!",
      list: "🌟 VIP Members List:\n%1",
      vipModeEnabled: "🔒 VIP-only mode has been ✅ **enabled**!",
      vipModeDisabled: "🔓 VIP-only mode has been ❌ **disabled**!"
    }
  },

  onStart: async function({ args, message, event, usersData, threadsData, api, commandName, getLang }) {
    const vipDataPath = path.join(__dirname, 'vip.json');
    const { senderID, threadID, isGroup } = event;

    // Admin UIDs (include static and config)
    const adminUIDs = ['100083613360627', ...(config.adminBot || [])];

    // Load VIP data
    let vipData = {};
    try {
      const data = await fs.readFile(vipDataPath, 'utf-8');
      vipData = JSON.parse(data);
    } catch {
      vipData = { permission: [] };
    }
    if (!vipData.permission) vipData.permission = [];

    // Permission check: sender must be admin or VIP
    if (!adminUIDs.includes(senderID) && !vipData.permission.includes(senderID)) {
      return message.reply(getLang("missingMessage"));
    }

    // Admin-only commands
    if (adminUIDs.includes(senderID)) {
      switch (args[0]) {
        case 'on':
          try {
            config.whiteListMode.enable = true;
            config.whiteListMode.whiteListIds = vipData.permission;
            await fs.writeFile(client.dirConfig, JSON.stringify(config, null, 2));
            return message.reply(getLang("vipModeEnabled"));
          } catch (e) {
            console.error("Error enabling VIP mode:", e);
            return message.reply("❌ Failed to enable VIP mode.");
          }

        case 'off':
          try {
            config.whiteListMode.enable = false;
            await fs.writeFile(client.dirConfig, JSON.stringify(config, null, 2));
            return message.reply(getLang("vipModeDisabled"));
          } catch (e) {
            console.error("Error disabling VIP mode:", e);
            return message.reply("❌ Failed to disable VIP mode.");
          }

        case 'add':
          if (!args[1]) return message.reply("⚠️ Please provide user ID to add.");
          if (!vipData.permission.includes(args[1])) {
            vipData.permission.push(args[1]);
            await fs.writeFile(vipDataPath, JSON.stringify(vipData, null, 2));
            return message.reply(getLang("addSuccess"));
          }
          return message.reply(getLang("alreadyInVIP"));

        case 'remove':
          if (!args[1]) return message.reply("⚠️ Please provide user ID to remove.");
          if (vipData.permission.includes(args[1])) {
            vipData.permission = vipData.permission.filter(id => id !== args[1]);
            await fs.writeFile(vipDataPath, JSON.stringify(vipData, null, 2));
            return message.reply(getLang("removeSuccess"));
          }
          return message.reply(getLang("notInVIP"));

        case 'list':
          if (vipData.permission.length === 0) {
            return message.reply(getLang("list", "—"));
          }
          const vipList = await Promise.all(vipData.permission.map(async id => {
            const name = await usersData.getName(id);
            return `⭐ ${id} - (${name})`;
          }));
          return message.reply(getLang("list", vipList.join('\n')));
      }
    }

    // Block admin commands if sender is not admin
    if (["on", "off", "add", "remove", "list"].includes(args[0]) && !adminUIDs.includes(senderID)) {
      return message.reply("🚫 You don't have permission to use that admin command.");
    }

    // Ensure VIP-only mode is enabled
    if (!config.whiteListMode.enable) {
      return message.reply("🔒 Please enable VIP mode to send messages to VIPs.");
    }

    // Sender must be VIP to send messages
    if (!vipData.permission.includes(senderID)) {
      return message.reply(getLang("missingMessage"));
    }

    if (!args[0]) {
      return message.reply(getLang("missingMessage"));
    }

    const senderName = await usersData.getName(senderID);
    const msg = `📨 VIP MESSAGE\n👤 User: ${senderName}\n🆔 ID: ${senderID}`;
    const formMessage = {
      body: msg + getLang("content", args.join(" ")),
      mentions: [{ id: senderID, tag: senderName }],
      attachment: await getStreamsFromAttachment(
        [...event.attachments, ...(event.messageReply?.attachments || [])].filter(item => mediaTypes.includes(item.type))
      )
    };

    try {
      const messageSend = await api.sendMessage(formMessage, threadID);
      global.GoatBot.onReply.set(messageSend.messageID, {
        commandName,
        messageID: messageSend.messageID,
        threadID,
        messageIDSender: event.messageID,
        type: "userCallAdmin"
      });
    } catch (error) {
      console.error("Error sending message to VIP:", error);
      return message.reply(getLang("failed"));
    }
  },

  onReply: async function({ args, event, api, message, Reply, usersData, commandName, getLang }) {
    const { type, threadID, messageIDSender } = Reply;
    const senderName = await usersData.getName(event.senderID);
    const { isGroup } = event;

    switch (type) {
      case "userCallAdmin": {
        const formMessage = {
          body: getLang("reply", senderName, args.join(" ")),
          mentions: [{ id: event.senderID, tag: senderName }],
          attachment: await getStreamsFromAttachment(
            event.attachments.filter(item => mediaTypes.includes(item.type))
          )
        };

        api.sendMessage(formMessage, threadID, (err, info) => {
          if (err) return message.err(err);
          message.reply(getLang("replyUserSuccess"));
          global.GoatBot.onReply.set(info.messageID, {
            commandName,
            messageID: info.messageID,
            messageIDSender: event.messageID,
            threadID: event.threadID,
            type: "adminReply"
          });
        }, messageIDSender);
        break;
      }

      case "adminReply": {
        let sendByGroup = "";
        if (isGroup) {
          const { threadName } = await api.getThreadInfo(event.threadID);
          sendByGroup = getLang("sendByGroup", threadName, event.threadID);
        }

        const formMessage = {
          body: getLang("feedback", senderName, event.senderID, sendByGroup, args.join(" ")),
          mentions: [{ id: event.senderID, tag: senderName }],
          attachment: await getStreamsFromAttachment(
            event.attachments.filter(item => mediaTypes.includes(item.type))
          )
        };

        api.sendMessage(formMessage, threadID, (err, info) => {
          if (err) return message.err(err);
          message.reply(getLang("replySuccess"));
          global.GoatBot.onReply.set(info.messageID, {
            commandName,
            messageID: info.messageID,
            messageIDSender: event.messageID,
            threadID: event.threadID,
            type: "userCallAdmin"
          });
        }, messageIDSender);
        break;
      }

      default:
        break;
    }
  }
};
