module.exports = {
	config: {
		name: "bankwithdraw",
		aliases: ["bw", "balwithdraw"],
		version: "3.0",
		author: "Eren",
		countDown: 5,
		role: 0,
		description: {
			en: "Withdraw money from your bank to wallet",
			vi: "Rút tiền từ ngân hàng về ví"
		},
		category: "economy",
		guide: {
			en: "{pn} <amount>: Withdraw specific money\n{pn} all: Withdraw everything",
			vi: "{pn} <số tiền>: Rút số tiền cụ thể\n{pn} all: Rút toàn bộ số tiền"
		}
	},

	langs: {
		en: {
			invalid: "❌ Please enter a valid amount or use 'all'.",
			zero: "⚠️ You have no money in your bank to withdraw.",
			notEnough: "😥 You don't have enough in the bank. Balance: %1$",
			success: "✅ You withdrew %1$ from your bank.\n💰 Wallet: %2$ | 🏦 Bank: %3$"
		},
		vi: {
			invalid: "❌ Vui lòng nhập số tiền hợp lệ hoặc dùng 'all'.",
			zero: "⚠️ Bạn không có tiền trong ngân hàng để rút.",
			notEnough: "😥 Bạn không đủ tiền trong ngân hàng. Số dư: %1$",
			success: "✅ Bạn đã rút %1$ từ ngân hàng.\n💰 Ví: %2$ | 🏦 Ngân hàng: %3$"
		}
	},

	onStart: async function ({ message, event, args, usersData, getLang }) {
		let input = args[0];
		if (!input)
			return message.reply(getLang("invalid"));

		const userData = await usersData.get(event.senderID);
		let money = userData.money || 0;
		let bank = userData.bank || 0;

		if (input.toLowerCase() === "all") {
			if (bank <= 0) return message.reply(getLang("zero"));
			money += bank;
			await usersData.set(event.senderID, { money, bank: 0 });
			return message.reply(getLang("success", bank, money, 0));
		}

		const amount = parseInt(input);
		if (isNaN(amount) || amount <= 0)
			return message.reply(getLang("invalid"));

		if (amount > bank)
			return message.reply(getLang("notEnough", bank));

		money += amount;
		bank -= amount;

		await usersData.set(event.senderID, { money, bank });
		message.reply(getLang("success", amount, money, bank));
	}
};
