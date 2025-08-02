module.exports = {
	config: {
		name: "baldeposit",
		aliases: ["baldeposit"],
		version: "2.0",
		author: "Eren",
		countDown: 5,
		role: 0,
		description: {
			en: "Deposit money into your bank",
			vi: "Gửi tiền vào ngân hàng"
		},
		category: "economy",
		guide: {
			en: "{pn} <amount>: Deposit money from wallet to bank",
			vi: "{pn} <số tiền>: Gửi tiền từ ví vào ngân hàng"
		}
	},

	langs: {
		en: {
			invalid: "❌ Please enter a valid amount to deposit.",
			notEnough: "😢 You don't have enough money. Your balance: %1$",
			success: "✅ You deposited %1$ to your bank. New balance: %2$, bank: %3$"
		},
		vi: {
			invalid: "❌ Vui lòng nhập số tiền hợp lệ để gửi.",
			notEnough: "😢 Bạn không đủ tiền. Số dư hiện tại: %1$",
			success: "✅ Bạn đã gửi %1$ vào ngân hàng. Số dư mới: %2$, ngân hàng: %3$"
		}
	},

	onStart: async function ({ message, event, args, usersData, getLang }) {
		const amount = parseInt(args[0]);
		if (isNaN(amount) || amount <= 0)
			return message.reply(getLang("invalid"));

		const userData = await usersData.get(event.senderID);
		let balance = userData.money || 0;
		let bank = userData.bank || 0;

		if (amount > balance)
			return message.reply(getLang("notEnough", balance));

		balance -= amount;
		bank += amount;

		await usersData.set(event.senderID, {
			money: balance,
			bank: bank
		});

		return message.reply(getLang("success", amount, balance, bank));
	}
};
