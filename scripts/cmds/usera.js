const { getTime } = global.utils;

module.exports = {
  config: {
    name: "usera",
    version: "2.0",
    author: "eran",
    countDown: 5,
    role: 2,
    description: {
      en: "Powerfully manage users: search, ban, and unban with authority"
    },
    category: "owner",
    guide: {
      en:
        "{pn} [find | -f | search | -s] <keyword> - Find users by name\n" +
        "{pn} [ban | -b] [@tag | reply | uid] <reason> - Ban user from using the bot\n" +
        "{pn} [unban | -u] [@tag | reply | uid] - Remove ban from a user"
    }
  },

  langs: {
    en: {
      noUserFound: "❌ No user matches the keyword: \"%1\"",
      userFound: "🔍 %1 user(s) matched \"%2\":\n%3",
      uidRequired: "❌ User ID is required. Use: user ban <uid> <reason>",
      reasonRequired: "❌ Reason is mandatory to ban a user. Use: user ban <uid> <reason>",
      userHasBanned: "⚠️ User [%1 | %2] is already banned:\n• Reason: %3\n• Time: %4",
      userBanned: "✅ User [%1 | %2] has been **BANNED**!\n• Reason: %3\n• Time: %4",
      uidRequiredUnban: "❌ You must provide a user ID to unban.",
      userNotBanned: "ℹ️ User [%1 | %2] is not currently banned.",
      userUnbanned: "✅ User [%1 | %2] has been **UNBANNED**."
    }
  },

  onStart: async function ({ args, usersData, message, event, prefix, getLang }) {
    const type = args[0];

    switch (type) {
      // FIND USERS
      case "find":
      case "-f":
      case "search":
      case "-s": {
        const keyword = args.slice(1).join(" ").toLowerCase();
        if (!keyword) return message.reply("❌ Please provide a name to search.");

        const allUsers = await usersData.getAll();
        const matched = allUsers.filter(u => (u.name || "").toLowerCase().includes(keyword));
        const list = matched.map(user => `• ${user.name} (${user.userID})`).join("\n");

        return message.reply(
          matched.length === 0
            ? getLang("noUserFound", keyword)
            : getLang("userFound", matched.length, keyword, list)
        );
      }

      // BAN USER
      case "ban":
      case "-b": {
        let uid, reason;

        if (event.type === "message_reply") {
          uid = event.messageReply.senderID;
          reason = args.slice(1).join(" ");
        } else if (Object.keys(event.mentions).length > 0) {
          uid = Object.keys(event.mentions)[0];
          reason = args.slice(1).join(" ").replace(event.mentions[uid], "").trim();
        } else {
          uid = args[1];
          reason = args.slice(2).join(" ").trim();
        }

        if (!uid) return message.reply(getLang("uidRequired"));
        if (!reason) return message.reply(getLang("reasonRequired"));

        const userData = await usersData.get(uid);
        const name = userData.name || "Unknown";
        const bannedStatus = userData.banned?.status;

        if (bannedStatus) {
          return message.reply(getLang(
            "userHasBanned",
            uid,
            name,
            userData.banned.reason,
            userData.banned.date
          ));
        }

        const time = getTime("DD/MM/YYYY HH:mm:ss");

        await usersData.set(uid, {
          banned: {
            status: true,
            reason,
            date: time
          }
        });

        console.log(`[BAN] ${uid} (${name}) was banned. Reason: ${reason}`);

        return message.reply(getLang("userBanned", uid, name, reason, time));
      }

      // UNBAN USER
      case "unban":
      case "-u": {
        let uid;

        if (event.type === "message_reply") {
          uid = event.messageReply.senderID;
        } else if (Object.keys(event.mentions).length > 0) {
          uid = Object.keys(event.mentions)[0];
        } else {
          uid = args[1];
        }

        if (!uid) return message.reply(getLang("uidRequiredUnban"));

        const userData = await usersData.get(uid);
        const name = userData.name || "Unknown";

        if (!userData.banned?.status) {
          return message.reply(getLang("userNotBanned", uid, name));
        }

        await usersData.set(uid, { banned: {} });

        console.log(`[UNBAN] ${uid} (${name}) was unbanned.`);

        return message.reply(getLang("userUnbanned", uid, name));
      }

      // UNKNOWN TYPE
      default:
        return message.SyntaxError();
    }
  }
};
