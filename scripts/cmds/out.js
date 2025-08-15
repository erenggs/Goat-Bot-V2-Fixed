const axios = require("axios");
const fs = require("fs-extra");
const request = require("request");

module.exports = {
	config: {
		name: "Out",
		aliases: ["l"],
		version: "1.0",
		author: "eran",
		countDown: 10,
		role: 2, // admin only
		shortDescription: "Bot will leave the group chat",
		longDescription: "Removes the bot from a group chat. Optionally, specify a thread ID.",
		category: "admin",
		guide: {
			vi: "{pn} [tid, blank for current chat]",
			en: "{pn} [tid, blank for current chat]"
		}
	},

	onStart: async function ({ api, event, args }) {
		try {
			// Determine thread ID: either from args or current chat
			let threadID = args.join(" ") ? args.join(" ") : event.threadID;

			// Send farewell message
			await api.sendMessage("BY Eren Yeager ber kore Deloh 😔", threadID);

			// Leave the group after sending message
			await api.removeUserFromGroup(api.getCurrentUserID(), threadID);

			// Optional: log to console
			console.log(`Left thread ${threadID} successfully.`);
		} catch (error) {
			console.error("Error in Out command:", error);
			await api.sendMessage("❌ Failed to leave the group.", event.threadID);
		}
	}
};
