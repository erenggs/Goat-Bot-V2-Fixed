const createFuncMessage = global.utils.message;
const handlerCheckDB = require("./handlerCheckData.js");

module.exports = (
	api,
	threadModel,
	userModel,
	dashBoardModel,
	globalModel,
	usersData,
	threadsData,
	dashBoardData,
	globalData
) => {
	// Load event handlers based on environment
	const handlerEvents = require(
		process.env.NODE_ENV === "development" ? "./handlerEvents.dev.js" : "./handlerEvents.js"
	)(api, threadModel, userModel, dashBoardModel, globalModel, usersData, threadsData, dashBoardData, globalData);

	return async function (event) {
		// Anti-inbox check
		if (
			global.GoatBot.config.antiInbox &&
			(event.senderID === event.threadID || event.userID === event.senderID || !event.isGroup)
		) return;

		// Create message helper
		const message = createFuncMessage(api, event);

		// Ensure DB is synced for users and threads
		await handlerCheckDB(usersData, threadsData, event);

		// Process event with handler
		const handlerChat = await handlerEvents(event, message);
		if (!handlerChat) return;

		const {
			onAnyEvent,
			onFirstChat,
			onStart,
			onChat,
			onReply,
			onEvent,
			handlerEvent,
			onReaction,
			typ,
			presence,
			read_receipt,
		} = handlerChat;

		// Run universal event hook
		if (typeof onAnyEvent === "function") onAnyEvent();

		// Handle specific event types
		switch (event.type) {
			case "message":
			case "message_reply":
			case "message_unsend":
				if (typeof onFirstChat === "function") onFirstChat();
				if (typeof onChat === "function") onChat();
				if (typeof onStart === "function") onStart();
				if (typeof onReply === "function") onReply();
				break;

			case "event":
				if (typeof handlerEvent === "function") handlerEvent();
				if (typeof onEvent === "function") onEvent();
				break;

			case "message_reaction":
				if (typeof onReaction === "function") onReaction();
				break;

			case "typ":
				if (typeof typ === "function") typ();
				break;

			case "presence":
				if (typeof presence === "function") presence();
				break;

			case "read_receipt":
				if (typeof read_receipt === "function") read_receipt();
				break;

			// future friend request events placeholders
			// case "friend_request_received": break;
			// case "friend_request_cancel": break;

			default:
				break;
		}
	};
};
