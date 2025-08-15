const { db, utils, GoatBot } = global;
const { config } = GoatBot;
const { log, getText } = utils;
const { creatingThreadData, creatingUserData } = global.client.database;

module.exports = async function (usersData, threadsData, event) {
	const threadID = event.threadID;
	const senderID = event.senderID || event.author || event.userID;

	// ———————————— CHECK THREAD DATA ———————————— //
	if (threadID) {
		try {
			if (global.temp.createThreadDataError.includes(threadID)) return;

			const existingCreatingThread = creatingThreadData.find(t => t.threadID === threadID);

			if (!existingCreatingThread) {
				if (!global.db.allThreadData.some(t => t.threadID === threadID)) {
					const threadData = await threadsData.create(threadID);
					log.info(
						"DATABASE",
						`New Thread: ${threadID} | ${threadData.threadName} | ${config.database.type}`
					);
				}
			} else {
				await existingCreatingThread.promise.catch(err => {
					if (err.name !== "DATA_ALREADY_EXISTS") throw err;
				});
			}
		} catch (err) {
			if (err.name !== "DATA_ALREADY_EXISTS") {
				global.temp.createThreadDataError.push(threadID);
				log.err(
					"DATABASE",
					getText("handlerCheckData", "cantCreateThread", threadID),
					err
				);
			}
		}
	}

	// ————————————— CHECK USER DATA ————————————— //
	if (senderID) {
		try {
			const existingCreatingUser = creatingUserData.find(u => u.userID === senderID);

			if (!existingCreatingUser) {
				if (!db.allUserData.some(u => u.userID === senderID)) {
					const userData = await usersData.create(senderID);
					log.info(
						"DATABASE",
						`New User: ${senderID} | ${userData.name} | ${config.database.type}`
					);
				}
			} else {
				await existingCreatingUser.promise.catch(err => {
					if (err.name !== "DATA_ALREADY_EXISTS") throw err;
				});
			}
		} catch (err) {
			if (err.name !== "DATA_ALREADY_EXISTS") {
				log.err(
					"DATABASE",
					getText("handlerCheckData", "cantCreateUser", senderID),
					err
				);
			}
		}
	}
};
