module.exports = {
	config: {
		name: "banksend",
		aliases: ["balbsend", "bpay", "btransfer"],
		version: "3.0",
		author: "Eren",
		countDown: 5,
		role: 0,
		description: {
			en: "Send money from your bank to another user’s bank",
			vi: "Chuyển tiền từ ngân hàng của bạn đến người khác"
		},
		category: "economy",
		guide: {
			en: "{pn} <amount> <@mention>\n{pn} all <@mention>",
			vi: "{pn} <số tiền> <@tag>\n{pn} all <@tag>"
		}
	},

	langs: {
		en: {
			noMention: "❌ Please mention someone to send money to.",
			invalidAmount: "❌ Please provide a valid amount or use 'all'.",
			notEnough: "😥 You don’t have enough money in the bank. Balance: %1$",
			success: "✅ Sent %1$ from your bank to %2$.\n🏦 Your new bank balance: %3$",
			zero: "⚠️ You don’t have any money in the bank to send."
		},
		vi: {
			noMention: "❌ Vui lòng tag người nhận tiền.",
			invalidAmount: "❌ Nhập số tiền hợp lệ hoặc dùng 'all'.",
			notEnough: "😥 Bạn không đủ tiền trong ngân hàng. Số dư: %1$",
			success: "✅ Đã chuyển %1$ từ ngân hàng của bạn đến %2$.\n🏦 Số dư mới: %3$",
			zero: "⚠️ Bạn không có tiền trong ngân hàng để gửi."
		}
	},

	onStart: async function ({ message, event, args, usersData, getLang }) {
		const mention = Object.keys(event.mentions)[0];
		if (!mention)
			return message.reply(getLang("noMention"));

		const senderID = event.senderID;
		const sender
