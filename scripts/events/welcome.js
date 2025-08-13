const { getTime, drive, getPrefix } = global.utils;
const axios = require("axios");
const fs = require("fs");
const path = require("path");

if (!global.temp.welcomeEvent)
	global.temp.welcomeEvent = {};

module.exports = {
	config: {
		name: "welcome",
		version: "2.2",
		author: "eran (updated with profile pics + user ID)",
		category: "events",
		role: 0
	},

	langs: {
		en: {
			session1: "morning",
			session2: "noon",
			session3: "afternoon",
			session4: "evening",
			welcomeMessage: "Thank you for inviting me to the group!\nBot prefix: %1\nTo view commands: %1help",
			multiple1: "you",
			multiple2: "you guys",
			defaultWelcomeMessage: "Hello {userName} (ID: {userID}).\nWelcome {multiple} to {boxName}.\nHave a nice {session} 🥺"
		},
		vi: {
			session1: "sáng",
			session2: "trưa",
			session3: "chiều",
			session4: "tối",
			welcomeMessage: "Cảm ơn bạn đã mời tôi vào nhóm!\nPrefix bot: %1\nXem lệnh: %1help",
			multiple1: "bạn",
			multiple2: "các bạn",
			defaultWelcomeMessage: "Xin chào {userName} (ID: {userID}).\nChào mừng {multiple} đến {boxName}.\nChúc {multiple} buổi {session} 🥺"
		}
	},

	onStart: async ({ threadsData, message, event, api, getLang }) => {
		if (event.logMessageType !== "log:subscribe") return;

		const { threadID } = event;
		const addedParticipants = event.logMessageData.addedParticipants;
		const { nickNameBot } = global.GoatBot.config;
		const prefix = getPrefix(threadID);

		// If bot joins
		if (addedParticipants.some(p => p.userFbId === api.getCurrentUserID())) {
			if (nickNameBot) {
				try {
					await api.changeNickname(nickNameBot, threadID, api.getCurrentUserID());
				} catch (err) {
					console.error("Nickname change failed:", err.message);
				}
			}
			return message.send(getLang("welcomeMessage", prefix));
		}

		// Init temp data
		if (!global.temp.welcomeEvent[threadID]) {
			global.temp.welcomeEvent[threadID] = { joinTimeout: null, dataAddedParticipants: [] };
		}

		// Add new members
		global.temp.welcomeEvent[threadID].dataAddedParticipants.push(...addedParticipants);

		// Reset batch timer
		clearTimeout(global.temp.welcomeEvent[threadID].joinTimeout);

		global.temp.welcomeEvent[threadID].joinTimeout = setTimeout(async () => {
			const threadData = await threadsData.get(threadID) || { settings: {}, data: {} };
			if (threadData.settings.sendWelcomeMessage === false) return;

			const newMembers = global.temp.welcomeEvent[threadID].dataAddedParticipants;
			const bannedList = threadData.data.banned_ban || [];
			const threadName = threadData.threadName || "this group";

			const userNames = [];
			const userIDs = [];
			const mentions = [];
			const attachments = [];

			for (const user of newMembers) {
				if (bannedList.some(b => b.id === user.userFbId)) continue;
				userNames.push(user.fullName);
				userIDs.push(user.userFbId);
				mentions.push({ tag: user.fullName, id: user.userFbId });

				// Fetch profile picture
				try {
					const picUrl = `https://graph.facebook.com/${user.userFbId}/picture?width=720&height=720`;
					const filePath = path.join(__dirname, `cache_${user.userFbId}.jpg`);
					const res = await axios.get(picUrl, { responseType: "stream" });
					const writer = fs.createWriteStream(filePath);
					res.data.pipe(writer);
					await new Promise(resolve => writer.on("finish", resolve));
					attachments.push(fs.createReadStream(filePath));
				} catch (err) {
					console.error(`Failed to fetch profile picture for ${user.fullName}:`, err.message);
				}
			}

			if (!userNames.length) return;

			const hours = parseInt(getTime("HH"), 10);
			const multiple = userNames.length > 1;
			let welcomeMessage = threadData.data.welcomeMessage || getLang("defaultWelcomeMessage");

			welcomeMessage = welcomeMessage
				.replace(/\{userName\}|\{userNameTag\}/g, userNames.join(", "))
				.replace(/\{userID\}/g, userIDs.join(", "))
				.replace(/\{boxName\}|\{threadName\}/g, threadName)
				.replace(/\{multiple\}/g, multiple ? getLang("multiple2") : getLang("multiple1"))
				.replace(/\{session\}/g,
					hours <= 10 ? getLang("session1")
						: hours <= 12 ? getLang("session2")
						: hours <= 18 ? getLang("session3")
						: getLang("session4")
				)
				.replace(/\{userprofile\}/g, ""); // Images sent separately

			const form = {
				body: welcomeMessage,
				mentions: welcomeMessage.includes("{userNameTag}") ? mentions : [],
				attachment: attachments
			};

			// Include additional configured attachments if any
			if (threadData.data.welcomeAttachment?.length) {
				try {
					const extraAttachments = await Promise.allSettled(
						threadData.data.welcomeAttachment.map(file =>
							file.startsWith("http")
								? global.utils.getStreamFromURL(file)
								: drive.getFile(file, "stream")
						)
					);
					form.attachment.push(...extraAttachments.filter(a => a.status === "fulfilled").map(a => a.value));
				} catch (err) {
					console.error("Extra attachment load error:", err.message);
				}
			}

			message.send(form);
			delete global.temp.welcomeEvent[threadID];
		}, 1500);
	}
};
