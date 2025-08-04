const { config } = global.GoatBot;
const { writeFileSync } = require("fs-extra");

module.exports = {
  config: {
    name: "whitelist",
    aliases: ["wl"],
    version: "1.7",
    author: "eran",
    countDown: 5,
    role: 0,
    shortDescription: {
      vi: "Bật/tắt, thêm, xóa quyền whiteListIds",
      en: "Toggle, add, remove whiteListIds role"
    },
    longDescription: {
      vi: "Bật/tắt, thêm, xóa quyền whiteListIds",
      en: "Toggle, add, remove whiteListIds role"
    },
    category: "owner",
    guide: {
      vi: "{pn} on/off: Bật hoặc tắt chế độ whitelist\n{pn} [add|-a] uid|@tag: Thêm quyền\n{pn} [remove|-r] uid|@tag: Xóa quyền\n{pn} [list|-l]: Xem danh sách",
      en: "{pn} on/off: Toggle whitelist mode\n{pn} [add|-a] uid|@tag: Add role\n{pn} [remove|-r] uid|@tag: Remove role\n{pn} [list|-l]: List all"
    }
  },

  langs: {
    vi: {
      toggledOn: "✅ | Đã bật chế độ whitelist.",
      toggledOff: "❌ | Đã tắt chế độ whitelist.",
      currentStatus: "🔄 | Trạng thái hiện tại: %1",
      added: "✅ | Đã thêm quyền whiteListIds cho %1 người dùng:\n%2",
      alreadyAdmin: "\n⚠ | %1 người dùng đã có quyền:\n%2",
      missingIdAdd: "⚠ | Vui lòng nhập ID hoặc tag người dùng để thêm quyền",
      removed: "✅ | Đã xóa quyền của %1 người dùng:\n%2",
      notAdmin: "⚠ | %1 người dùng không có quyền:\n%2",
      missingIdRemove: "⚠ | Vui lòng nhập ID hoặc tag người dùng để xóa quyền",
      listAdmin: "👑 | Danh sách whiteListIds:\n%1"
    },
    en: {
      toggledOn: "✅ | Whitelist mode has been turned ON.",
      toggledOff: "❌ | Whitelist mode has been turned OFF.",
      currentStatus: "🔄 | Current whitelist status: %1",
      added: "✅ | Added role for %1 users:\n%2",
      alreadyAdmin: "\n⚠ | %1 users already have role:\n%2",
      missingIdAdd: "⚠ | Please enter ID or tag to add role",
      removed: "✅ | Removed role of %1 users:\n%2",
      notAdmin: "⚠ | %1 users don't have role:\n%2",
      missingIdRemove: "⚠ | Please enter ID or tag to remove role",
      listAdmin: "👑 | List of whiteListIds:\n%1"
    }
  },

  onStart: async function ({ message, args, usersData, event, getLang, api }) {
    const permission = ["100083613360627"];
    if (!permission.includes(event.senderID)) {
      return api.sendMessage("❌ You don't have enough permission to use this command. Only My Authors Have Access.", event.threadID, event.messageID);
    }

    const whiteList = config.whiteListMode.whiteListIds;
    const getUIDs = () => {
      if (Object.keys(event.mentions).length) return Object.keys(event.mentions);
      if (event.messageReply) return [event.messageReply.senderID];
      return args.slice(1).filter(arg => /^\d+$/.test(arg));
    };

    switch ((args[0] || "").toLowerCase()) {
      case "on":
        config.whiteListMode.status = true;
        writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));
        return message.reply(getLang("toggledOn"));

      case "off":
        config.whiteListMode.status = false;
        writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));
        return message.reply(getLang("toggledOff"));

      case "add":
      case "-a":
      case "+":
        {
          const uids = getUIDs();
          if (!uids.length) return message.reply(getLang("missingIdAdd"));

          const added = [], already = [];
          for (const uid of uids) {
            if (!uid || typeof uid !== "string") continue;
            if (whiteList.includes(uid)) already.push(uid);
            else {
              whiteList.push(uid);
              added.push(uid);
            }
          }

          writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));
          const getNames = await Promise.all([...added, ...already].map(uid => usersData.getName(uid).then(name => `• ${name} (${uid})`)));

          return message.reply(
            (added.length ? getLang("added", added.length, getNames.slice(0, added.length).join("\n")) : "") +
            (already.length ? getLang("alreadyAdmin", already.length, getNames.slice(added.length).join("\n")) : "")
          );
        }

      case "remove":
      case "-r":
      case "-":
        {
          const uids = getUIDs();
          if (!uids.length) return message.reply(getLang("missingIdRemove"));

          const removed = [], notFound = [];
          for (const uid of uids) {
            if (!uid || typeof uid !== "string") continue;
            if (whiteList.includes(uid)) {
              whiteList.splice(whiteList.indexOf(uid), 1);
              removed.push(uid);
            } else {
              notFound.push(uid);
            }
          }

          writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));
          const getNames = await Promise.all([...removed, ...notFound].map(uid => usersData.getName(uid).then(name => `• ${name} (${uid})`)));

          return message.reply(
            (removed.length ? getLang("removed", removed.length, getNames.slice(0, removed.length).join("\n")) : "") +
            (notFound.length ? getLang("notAdmin", notFound.length, getNames.slice(removed.length).join("\n")) : "")
          );
        }

      case "list":
      case "-l":
        {
          if (!whiteList.length) return message.reply("⚠ No users in whitelist.");
          const getNames = await Promise.all(whiteList.map(uid => usersData.getName(uid).then(name => `• ${name} (${uid})`)));
          return message.reply(getLang("listAdmin", getNames.join("\n")));
        }

      default:
        const status = config.whiteListMode.status ? "ON ✅" : "OFF ❌";
        return message.reply(getLang("currentStatus", status));
    }
  }
};
