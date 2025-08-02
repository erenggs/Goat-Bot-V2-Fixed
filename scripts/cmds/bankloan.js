module.exports = {
  config: {
    name: "bankloan",
    aliases: ["balloan", "getloan", "takeloan"],
    version: "3.0",
    author: "Eren",
    countDown: 10,
    role: 0,
    description: {
      en: "Take a loan from the virtual bank (with optional interest)",
      vi: "Vay tiền từ ngân hàng ảo (có thể có lãi suất)"
    },
    category: "economy",
    guide: {
      en: "{pn} <amount> — Take a loan (Max: 5000)",
      vi: "{pn} <số tiền> — Vay tiền (Tối đa: 5000)"
    }
  },

  langs: {
    en: {
      invalid: "❌ Please enter a valid loan amount (Max: %1$).",
      alreadyLoaned: "⚠️ You already took a loan. Repay it first!",
      granted: "✅ Loan of %1$ granted! Added to your wallet.",
      max: "⚠️ You can only take a loan up to %1$."
    },
    vi: {
      invalid: "❌ Vui lòng nhập số tiền hợp lệ (Tối đa: %1$).",
      alreadyLoaned: "⚠️ Bạn đã vay tiền. Vui lòng trả trước khi vay tiếp!",
      granted: "✅ Đã cho vay %1$. Số tiền đã được thêm vào ví.",
      max: "⚠️ Bạn chỉ được vay tối đa %1$."
    }
  },

  // You can change this to your own cap
  loanSettings: {
    maxLoanAmount: 5000,
    allowMultipleLoans: false, // Set to true to allow stacking loans
    loanField: "loan" // Stored in userData
  },

  onStart: async function ({ message, event, args, usersData, getLang }) {
    const { maxLoanAmount, allowMultipleLoans, loanField } = this.loanSettings;
    const uid = event.senderID;
    const userData = await usersData.get(uid);
    const currentLoan = userData[loanField] || 0;

    const amount = parseInt(args[0]);
    if (isNaN(amount) || amount <= 0 || amount > maxLoanAmount)
      return message.reply(getLang("invalid", maxLoanAmount));

    if (!allowMultipleLoans && currentLoan > 0)
      return message.reply(getLang("alreadyLoaned"));

    // Grant loan: Add to money + update loan record
    const wallet = userData.money || 0;
    const newLoan = currentLoan + amount;

    await usersData.set(uid, {
      money: wallet + amount,
      [loanField]: newLoan
    });

    return message.reply(getLang("granted", amount));
  }
};
