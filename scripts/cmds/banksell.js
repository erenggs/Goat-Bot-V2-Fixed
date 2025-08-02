module.exports = {
  config: {
    name: "banksell",
    aliases: ["sellstock", "balsell"],
    version: "3.0",
    author: "Eran",
    countDown: 5,
    role: 0,
    description: {
      en: "Sell stocks from your portfolio",
      vi: "Bán cổ phiếu từ danh mục đầu tư"
    },
    category: "economy",
    guide: {
      en: "{pn} <amount> <stock>\nExample: {pn} 10 AAPL",
      vi: "{pn} <số lượng> <mã cổ phiếu>\nVí dụ: {pn} 10 AAPL"
    }
  },

  langs: {
    en: {
      invalidAmount: "❌ Please enter a valid amount (>0).",
      invalidStock: "❌ Unknown stock symbol '%1'.",
      notOwned: "😥 You don’t own enough shares of %1. Owned: %2",
      success: "✅ You sold %1 shares of %2 for %3$. New wallet balance: %4$",
      noStocks: "❌ Please specify a stock symbol."
    },
    vi: {
      invalidAmount: "❌ Vui lòng nhập số lượng hợp lệ (>0).",
      invalidStock: "❌ Mã cổ phiếu '%1' không hợp lệ.",
      notOwned: "😥 Bạn không sở hữu đủ cổ phiếu %1. Đang sở hữu: %2",
      success: "✅ Bạn đã bán %1 cổ phiếu %2 với giá %3$. Số dư ví mới: %4$",
      noStocks: "❌ Vui lòng nhập mã cổ phiếu."
    }
  },

  // Same stock prices as bankinvest.js (replace or sync as needed)
  stockPrices: {
    AAPL: 150,
    GOOG: 2800,
    TSLA: 700,
    MSFT: 300,
    AMZN: 3500
  },

  onStart: async function ({ message, args, usersData, event, getLang }) {
    if (args.length < 2)
      return message.reply(getLang("noStocks"));

    const amount = parseInt(args[0]);
    const stock = args[1].toUpperCase();

    if (isNaN(amount) || amount <= 0)
      return message.reply(getLang("invalidAmount"));

    if (!this.stockPrices[stock])
      return message.reply(getLang("invalidStock", stock));

    const uid = event.senderID;
    const userData = await usersData.get(uid);

    userData.investments = userData.investments || {};
    const ownedShares = userData.investments[stock] || 0;

    if (ownedShares < amount)
      return message.reply(getLang("notOwned", stock, ownedShares));

    const pricePerShare = this.stockPrices[stock];
    const totalGain = pricePerShare * amount;

    // Update portfolio and wallet
    userData.investments[stock] = ownedShares - amount;
    if (userData.investments[stock] === 0) delete userData.investments[stock];

    userData.money = (userData.money || 0) + totalGain;

    await usersData.set(uid, userData);

    return message.reply(getLang("success", amount, stock, totalGain, userData.money));
  }
};
