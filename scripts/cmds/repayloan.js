module.exports = {
  config: {
    name: "repayloan",
    aliases: ["payloan", "loanrepay", "balrepay"],
    version: "3.0",
    author: "Eren",
    countDown: 5,
    role: 0,
    description: {
      en: "Repay your loan using your wallet",
      vi: "Trả nợ bằng tiền trong ví"
    },
    category: "economy",
    guide: {
      en: "{pn} <amount> — Repay loan from wallet\n{pn} all — Pay full loan",
      vi: "{pn} <số tiền> — Trả nợ từ ví\n{pn} all — Trả hết nợ"
    }
  },

  langs: {
    en: {
      noLoan: "🎉 You don't have any loans to repay!",
      notEnough: "😥 You don't have enough in your wallet. Wallet: %1$",
      overpay: "⚠️ You only owe %1$. Please enter a valid amount.",
      invalid: "❌ Enter a valid amount or use 'all'.",
      success: "✅ You repaid %1$ from your wallet.\n🧾 Remaining loan: %2$ | 💰 Wallet: %3$"
    },
    vi: {
      noLoan: "🎉 Bạn không có khoản nợ nào để trả!",
      notEnough: "😥 Bạn không đủ tiền trong ví. Ví: %1$",
      overpay: "⚠️ Bạn chỉ nợ %1$. Vui lòng nhập số tiền hợp lệ.",
      invalid: "❌ Nhập số tiền hợp lệ hoặc dùng 'all'.",
      success: "✅ Bạn đã trả %1$ từ ví.\n🧾 Nợ còn lại: %2$ | 💰 Ví: %3$"
    }
  },

  onStart: async function ({ message, event, args, usersData, getLang }) {
    const uid = event.senderID;
    const userData = await usersData.get(uid);
    let loan = userData.loan || 0;

    if (loan <= 0)
      return message.reply(getLang("noLoan"));

    const wallet = userData.money || 0;
    const input = args[0];

    if (!input) return message.reply(getLang("invalid"));

    if (input.toLowerCase() === "all") {
      const amountToPay = Math.min(loan, wallet);
      if (amountToPay <= 0)
        return message.reply(getLang("notEnough", wallet));

      loan -= amountToPay;
      await usersData.set(uid, {
        loan,
        money: wallet - amountToPay
      });

      return message.reply(getLang("success", amountToPay, loan, wallet - amountToPay));
    }

    const amount = parseInt(input);
    if (isNaN(amount) || amount <= 0)
      return message.reply(getLang("invalid"));

    if (amount > loan)
      return message.reply(getLang("overpay", loan));

    if (amount > wallet)
      return message.reply(getLang("notEnough", wallet));

    loan -= amount;
    await usersData.set(uid, {
      loan,
      money: wallet - amount
    });

    return message.reply(getLang("success", amount, loan, wallet - amount));
  }
};
