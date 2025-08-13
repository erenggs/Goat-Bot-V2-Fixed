const { getTime } = global.utils;

module.exports = {
	config: {
		name: "logsbot",
		isBot: true,
		version: "2.0",
		author: "eran",
		envConfig: { allow: true },
		category: "events"
	},

	langs: {
		vi: {
			title: "====== Nhật ký bot ======",
			added: "\n✅\nSự kiện: bot được thêm vào nhóm mới\n- Người thêm: %1",
			kicked: "\n❌\nSự kiện: bot bị kick\n- Người kick: %1",
			message: "\n💬\nTin nhắn mới từ %1\n- Nội dung: %2",
			footer: "\n- User ID: %1\n- Nhóm: %2\n- Group ID: %3\n- Thời gian: %4"
		},
		en: {
			title: "====== Bot logs ======",
			added: "\n✅\nEvent: bot has been added to a new group\n- Added by: %1",
			kicked: "\n❌\nEvent: bot has been kicked\n- Kicked by: %1",
			message: "\n💬\nNew message from %1\n- Content: %2",
			footer: "\n- User ID: %1\n- Group: %2\n- Group ID: %3\n- Time: %4"
		}
	},

	onStart: async ({ usersData, threadsData, event, api, getLang }) => {
		const botID = api.getCurrentUserID();
		const { logMessageType, logMessageData, author, threadID, body } = event;
		const { config } = global.GoatBot;

		if (!config?.adminBot?.length) return;

		let msg = getLang("title");
		let threadName = "";

		try {
			const threadInfo = await api.getThreadInfo(threadID).catch(() => null);
			threadName = threadInfo?.threadName || (await threadsData.get(threadID))?.threadName || "Unknown";
		} catch { threadName = "Unknown"; }

		// Bot added/kicked events
		if (logMessageType === "log:subscribe" && logMessageData.addedParticipants.some(p => p.userFbId == botID)) {
			if (author === botID) return;
			const authorName = await usersData.getName(author);
			msg += getLang("added", authorName);
		} else if (logMessageType === "log:unsubscribe" && logMessageData.leftParticipantFbId == botID) {
			if (author === botID) return;
			const authorName = await usersData.getName(author);
			msg += getLang("kicked", authorName);
		} 
		// General message logging
		else if (body && author !== botID) {
			const authorName = await usersData.getName(author);
			msg += getLang("message", authorName, body);
		} else {
			return;
		}

		const time = getTime("DD/MM/YYYY HH:mm:ss");
		msg += getLang("footer", author, threadName, threadID, time);

		for (const adminID of config.adminBot) {
			api.sendMessage(msg, adminID);
		}
	}
};
