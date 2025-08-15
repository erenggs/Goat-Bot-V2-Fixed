const { config } = global.GoatBot;
const { writeFileSync } = require("fs-extra");

module.exports = {
	config: {
		name: "admin",
		aliases: ["adminrole", "adm", "ad"],
		version: "1.8", // 🔄 Updated version
		author: "eran",
		countDown: 10,
		role: 2,
		description: {
			vi: "🛠️ Thêm, xóa, sửa quyền admin",
			en: "🛠️ Add, remove, edit admin role"
		},
		category: "👥 box chat",
		guide: {
			vi: '📌 {pn} [add | -a] <uid | @tag>: Thêm quyền admin cho người dùng'
				+ '\n📌 {pn} [remove | -r] <uid | @tag>: Xóa quyền admin của người dùng'
				+ '\n📌 {pn} [list | -l]: Liệt kê danh sách admin',
			en: '📌 {pn} [add | -a] <uid | @tag>: Add admin role for user'
				+ '\n📌 {pn} [remove | -r] <uid | @tag>: Remove admin role of user'
				+ '\n📌 {pn} [list | -l]: List all admins'
		}
	},

	langs: {
		vi: {
			added: "✅ | 🎉 Đã thêm quyền admin cho %1 người dùng:\n%2",
			alreadyAdmin: "\n⚠️ | 👀 %1 người dùng đã có quyền admin:\n%2",
			missingIdAdd: "⚠️ | ❗ Vui lòng nhập ID hoặc tag người dùng cần thêm quyền admin",
			removed: "✅ | 🗑️ Đã xóa quyền admin của %1 người dùng:\n%2",
			notAdmin: "⚠️ | 🚫 %1 người dùng không có quyền admin:\n%2",
			missingIdRemove: "⚠️ | ❗ Vui lòng nhập ID hoặc tag người dùng cần xóa quyền admin",
			listAdmin: "👑 | 📋 Danh sách admin:\n%1"
		},
		en: {
			added: "✅ | 🎉 Added admin role for %1 users:\n%2",
			alreadyAdmin: "\n⚠️ | 👀 %1 users already have admin role:\n%2",
			missingIdAdd: "⚠️ | ❗ Please enter ID or tag user to add admin role",
			removed: "✅ | 🗑️ Removed admin role of %1 users:\n%2",
			notAdmin: "⚠️ | 🚫 %1 users don't have admin role:\n%2",
			missingIdRemove: "⚠️ | ❗ Please enter ID or tag user to remove admin role",
			listAdmin: "👑 | 📋 List of admins:\n%1"
		}
	},

	onStart: async function ({ message, args, usersData, event, getLang }) {
		const { mentions, messageReply } = event;

		switch (args[0]) {
			case "add":
			case "-a": {
				if (!args[1] && !messageReply && Object.keys(mentions).length === 0)
					return message.reply(getLang("missingIdAdd"));

				let uids = [];
				if (Object.keys(mentions).length > 0)
					uids = Object.keys(mentions);
				else if (messageReply)
					uids.push(messageReply.senderID);
				else
					uids = args.slice(1).filter(arg => /^\d+$/.test(arg));

				const notAdminIds = [], alreadyAdmins = [];

				for (const uid of uids) {
					if (config.adminBot.includes(uid)) alreadyAdmins.push(uid);
					else notAdminIds.push(uid);
				}

				config.adminBot.push(...notAdminIds);
				config.adminBot = [...new Set(config.adminBot)];

				writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));

				const getNames = await Promise.all(uids.map(uid => usersData.getName(uid).then(name => ({ uid, name }))));

				return message.reply(
					(notAdminIds.length > 0 ? getLang("added", notAdminIds.length, getNames.filter(u => notAdminIds.includes(u.uid)).map(u => `• 👤 ${u.name} (${u.uid})`).join("\n")) : "") +
					(alreadyAdmins.length > 0 ? getLang("alreadyAdmin", alreadyAdmins.length, getNames.filter(u => alreadyAdmins.includes(u.uid)).map(u => `• 👤 ${u.name} (${u.uid})`).join("\n")) : "")
				);
			}

			case "remove":
			case "-r": {
				if (!args[1] && Object.keys(mentions).length === 0)
					return message.reply(getLang("missingIdRemove"));

				let uids = [];
				if (Object.keys(mentions).length > 0)
					uids = Object.keys(mentions);
				else
					uids = args.slice(1).filter(arg => /^\d+$/.test(arg));

				const stillAdmins = [], notAdmins = [];

				for (const uid of uids) {
					if (config.adminBot.includes(uid)) stillAdmins.push(uid);
					else notAdmins.push(uid);
				}

				for (const uid of stillAdmins)
					config.adminBot.splice(config.adminBot.indexOf(uid), 1);

				writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));

				const getNames = await Promise.all(stillAdmins.map(uid => usersData.getName(uid).then(name => ({ uid, name }))));

				return message.reply(
					(stillAdmins.length > 0 ? getLang("removed", stillAdmins.length, getNames.map(({ uid, name }) => `• ❌ ${name} (${uid})`).join("\n")) : "") +
					(notAdmins.length > 0 ? getLang("notAdmin", notAdmins.length, notAdmins.map(uid => `• ❓ ${uid}`).join("\n")) : "")
				);
			}

			case "list":
			case "-l": {
				const getNames = await Promise.all(config.adminBot.map(uid => usersData.getName(uid).then(name => ({ uid, name }))));
				return message.reply(getLang("listAdmin", getNames.map(({ uid, name }) => `• 👑 ${name} (${uid})`).join("\n")));
			}

			default:
				return message.SyntaxError();
		}
	}
};
