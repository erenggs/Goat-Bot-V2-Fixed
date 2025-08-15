const axios = require('axios');

function filterAddress(address) {
	return address
		.split(/[,;\s]/)
		.map(id => id.trim())
		.filter(id => id);
}

// This handler runs when api.listenMqtt encounters an error
// (e.g., account banned, password changed, etc.)
module.exports = async function ({
	api,
	threadModel,
	userModel,
	dashBoardModel,
	globalModel,
	threadsData,
	usersData,
	dashBoardData,
	globalData,
	error
}) {
	const { config, botID } = global.GoatBot;
	const { log, utils } = global;

	const configNoti = config.notiWhenListenMqttError || {};

	/* ===== SEND EMAIL TO ADMIN ===== */
	if (configNoti.gmail?.enable) {
		const { sendMail, Prism } = utils;
		let highlightCode = error;

		if (typeof error === "object" && !error.stack)
			highlightCode = Prism.highlight(JSON.stringify(error, null, 2), Prism.languages.json, 'json');
		else if (error.stack)
			highlightCode = Prism.highlight(error.stack, Prism.languages.jsstacktrace, 'jsstacktrace');

		const mailAddresses = filterAddress(configNoti.gmail.emailGetNoti);
		for (const mail of mailAddresses) {
			if (!mail) continue;

			sendMail({
				to: mail,
				subject: `Goat Bot Error Report (Bot ID: ${botID})`,
				text: "",
				html: `<h2>Error in Goat Bot (ID: ${botID})</h2>
				<div><pre style="background:#272822;padding:1em;"><code style="color:#f8f8f2;font-family:Consolas,Monaco,monospace;">${highlightCode}</code></pre></div>`
			})
				.then(() => log.info("handlerWhenListenHasError", `Mail sent to ${mail}`))
				.catch(err => log.err("handlerWhenListenHasError", "Cannot send mail", err));
		}
	}

	/* ===== SEND TELEGRAM MESSAGE TO ADMIN ===== */
	if (configNoti.telegram?.enable) {
		const TELEBOT_TOKEN = configNoti.telegram.botToken;
		let highlightCode = error;

		if (typeof error === "object" && !error.stack)
			highlightCode = JSON.stringify(error, null, 2);
		else if (error.stack)
			highlightCode = error.stack;

		const ADMIN_IDS = filterAddress(configNoti.telegram.chatId);
		for (const ADMIN_ID of ADMIN_IDS) {
			if (!ADMIN_ID) continue;

			const MAX_LENGTH = 4096;
			const messageHeader = `Error in Goat Bot (ID: ${botID}):\n`;
			let messageBody = `\`\`\`json\n${highlightCode}\n\`\`\``;

			if ((messageHeader.length + messageBody.length) > MAX_LENGTH) {
				const lastString = "\n\n... (Too long to show)```";
				messageBody = messageBody.slice(0, MAX_LENGTH - messageHeader.length - lastString.length) + lastString;
			}

			axios.post(`https://api.telegram.org/bot${TELEBOT_TOKEN}/sendMessage`, {
				chat_id: ADMIN_ID,
				text: messageHeader + messageBody,
				parse_mode: "Markdown"
			})
				.then(() => log.info("handlerWhenListenHasError", `Telegram message sent to ${ADMIN_ID}`))
				.catch(err => log.err("handlerWhenListenHasError", "Cannot send Telegram message", err.response?.data));
		}
	}

	/* ===== SEND DISCORD WEBHOOK MESSAGE ===== */
	if (configNoti.discordHook?.enable) {
		let highlightCode = error;

		if (typeof error === "object" && !error.stack)
			highlightCode = JSON.stringify(error, null, 2);
		else if (error.stack)
			highlightCode = error.stack;

		const baseContent = `**Error in Goat Bot (ID: ${botID}):**\n\`\`\`json\n{highlightCode}\n\`\`\``;
		const MAX_LENGTH = 2000;

		let content = baseContent.replace("{highlightCode}", highlightCode);
		if (content.length > MAX_LENGTH) {
			const lastString = "\n\n... (Too long to show)```";
			highlightCode = highlightCode.slice(0, MAX_LENGTH - baseContent.length - lastString.length) + lastString;
			content = baseContent.replace("{highlightCode}", highlightCode);
		}

		const webhookUrls = filterAddress(configNoti.discordHook.webhookUrl);
		for (const WEBHOOK of webhookUrls) {
			if (!WEBHOOK) continue;

			axios.post(WEBHOOK, { content, embeds: null, attachments: [] })
				.then(() => log.info("handlerWhenListenHasError", `Discord webhook sent to ${WEBHOOK}`))
				.catch(err => log.err("handlerWhenListenHasError", "Cannot send Discord webhook", err.response?.data));
		}
	}

	/* ===== CUSTOM HANDLER CODE CAN GO HERE ===== */
};
