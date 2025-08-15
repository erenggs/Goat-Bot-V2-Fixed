const chalk = require('chalk');
const path = require('path');
const { log, createOraDots, getText } = global.utils;

module.exports = async function (api, createLine) {
	// ———————————————————— LOAD DATA ———————————————————— //
	console.log(chalk.hex("#f5ab00")(createLine("DATABASE")));

	// Load controller and models
	const controllerPath = path.join(__dirname, '..', '..', 'database/controller/index.js');
	const controller = await require(controllerPath)(api);
	const {
		threadModel,
		userModel,
		dashBoardModel,
		globalModel,
		threadsData,
		usersData,
		dashBoardData,
		globalData,
		sequelize
	} = controller;

	// Log loaded data counts
	log.info(
		'DATABASE',
		getText('loadData', 'loadThreadDataSuccess', global.db.allThreadData.filter(t => t.threadID.toString().length > 15).length)
	);
	log.info('DATABASE', getText('loadData', 'loadUserDataSuccess', global.db.allUserData.length));

	// Auto sync if enabled
	if (api && global.GoatBot.config.database.autoSyncWhenStart === true) {
		console.log(chalk.hex("#f5ab00")(createLine("AUTO SYNC")));
		const spin = createOraDots(getText('loadData', 'refreshingThreadData'));

		try {
			api.setOptions({ logLevel: 'silent' });
			spin._start();

			const threadDataWillSet = [];
			const allThreadData = [...global.db.allThreadData];
			const allThreadInfo = await api.getThreadList(9999999, null, 'INBOX');
			const botID = api.getCurrentUserID();

			for (const threadInfo of allThreadInfo) {
				if (threadInfo.isGroup && !allThreadData.some(thread => thread.threadID === threadInfo.threadID)) {
					threadDataWillSet.push(await threadsData.create(threadInfo.threadID, threadInfo));
				} else {
					const threadRefreshed = await threadsData.refreshInfo(threadInfo.threadID, threadInfo);
					const index = allThreadData.findIndex(thread => thread.threadID === threadInfo.threadID);
					if (index !== -1) allThreadData.splice(index, 1);
					threadDataWillSet.push(threadRefreshed);
				}
				global.db.receivedTheFirstMessage[threadInfo.threadID] = true;
			}

			// Handle threads that no longer have the bot
			const allThreadDataDontHaveBot = allThreadData.filter(thread => !allThreadInfo.some(t => t.threadID === thread.threadID));
			for (const thread of allThreadDataDontHaveBot) {
				const botMember = thread.members.find(m => m.userID == botID);
				if (botMember) {
					botMember.inGroup = false;
					await threadsData.set(thread.threadID, { members: thread.members });
				}
			}

			global.db.allThreadData = [...threadDataWillSet, ...allThreadDataDontHaveBot];
			spin._stop();
			log.info('DATABASE', getText('loadData', 'refreshThreadDataSuccess', global.db.allThreadData.length));
		} catch (err) {
			spin._stop();
			log.error('DATABASE', getText('loadData', 'refreshThreadDataError'), err);
		} finally {
			api.setOptions({ logLevel: global.GoatBot.config.optionsFca.logLevel });
		}
	}

	// Return models and controllers
	return {
		threadModel: threadModel || null,
		userModel: userModel || null,
		dashBoardModel: dashBoardModel || null,
		globalModel: globalModel || null,
		threadsData,
		usersData,
		dashBoardData,
		globalData,
		sequelize
	};
};
