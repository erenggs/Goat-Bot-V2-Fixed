const fs = require("fs-extra");
const { config } = global.GoatBot;
const { client } = global;

module.exports = {
	config: {
		name: "adminonly",
		aliases: ["adonly", "onlyad", "onlyadmin"],
		version: "1.8",
		author: "eran",
		countDown: 10,
		role: 2,
		description: {
			vi: "Bật/tắt chế độ chỉ admin mới có thể sử dụng bot",
			en: "Turn on/off only admin can use bot"
		},
		category: "owner",
		guide: {
			vi: "✅ {pn} [on | off]: Bật/tắt chế độ chỉ admin mới có thể sử dụng bot\n🔔 {pn} noti [on | off]: Bật/tắt thông báo khi người dùng không phải admin",
			en: "✅ {pn} [on | off]: Turn on/off the mode only admin can use bot\n🔔 {pn} noti [on | off]: Turn on/off the notification when user is not admin"
		}
	},

	langs: {
		vi: {
			turnedOn: "✅ Đã bật chế độ chỉ admin mới có thể sử dụng bot",
			turnedOff: "❌ Đã tắt chế độ chỉ admin mới có thể sử dụng bot",
			turnedOnNoti: "🔔 Đã bật thông báo khi người dùng không phải là admin sử dụng bot",
			turnedOffNoti: "🔕 Đã tắt thông báo khi người dùng không phải là admin sử dụng bot"
		},
		en: {
			turnedOn: "✅ Turned on the mode only admin can use bot",
			turnedOff: "❌ Turned off the mode only admin can use bot",
			turnedOnNoti: "🔔 Turned on the notification when user is not admin use bot",
			turnedOffNoti: "🔕 Turned off the notification when user is not admin use bot"
		}
	},

	onStart: async function ({ args, message, getLang }) {
		try {
			// Determine if user wants to toggle notifications
			const isNotification = args[0]?.toLowerCase() === "noti";
			const actionArg = isNotification ? args[1]?.toLowerCase() : args[0]?.toLowerCase();

			// Validate input
			if (!["on", "off"].includes(actionArg)) return message.SyntaxError();

			const value = actionArg === "on";

			// Update config
			if (isNotification) {
				config.hideNotiMessage = config.hideNotiMessage || {};
				config.hideNotiMessage.adminOnly = !value;
				message.reply(getLang(value ? "turnedOnNoti" : "turnedOffNoti"));
			} else {
				config.adminOnly = config.adminOnly || {};
				config.adminOnly.enable = value;
				message.reply(getLang(value ? "turnedOn" : "turnedOff"));
			}

			// Save updated config
			await fs.writeFile(client.dirConfig, JSON.stringify(config, null, 2));

		} catch (err) {
			console.error("❌ Error in adminonly command:", err);
			message.reply("❌ An error occurred while updating the config.");
		}
	}
};
