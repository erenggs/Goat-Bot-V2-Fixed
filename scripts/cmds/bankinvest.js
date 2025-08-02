module.exports = {
  config: {
    name: "bankinvest",
    aliases: ["balinvest", "buystock"],
    version: "3.0",
    author: "Eran",
    countDown: 5,
    role: 0,
    description: {
      en: "Buy stocks using your wallet money",
      vi: "Mua cổ phiếu bằng tiền trong ví"
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
      notEnough: "😥 You don't have enough money in your wallet. Needed: %1$, You have: %2$",
      success: "✅ You bought %1 shares of %2 for %3$. Your new wallet balance: %4$",
      noStocks: "❌ Please specify a stock symbol."
    },
    vi: {
      invalidAmount: "❌ Vui lòng nhập số lượng hợp lệ (>0).",
      invalidStock: "❌ Mã cổ phiếu '%1' không hợp lệ.",
      notEnough: "😥 Bạn không đủ tiền trong ví. Cần: %1$, Bạn có: %2$",
      success: "✅ Bạn đã mua %1 cổ phiếu %2 với giá %3$. Số dư ví mới: %4$",
      noStocks: "❌ Vui lòng nhập mã cổ phiếu."
    }
  },

  // Sample static stock prices — replace with real API or dynamic system as needed
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

    const pricePerShare = this.stockPrices[stock];
    const totalCost = pricePerShare * amount;

    const uid = event.senderID;
    const userData = await usersData.get(uid);
    let wallet = userData.money || 0;

    if (wallet < totalCost)
      return message.reply(getLang("notEnough", totalCost, wallet));

    wallet -= totalCost;

    // Update investments
    userData.money = wallet;
    userData.investments = userData.investments || {};
    userData.investments[stock] = (userData.investments[stock] || 0) + amount;

    await usersData.set(uid, userData);

    return message.reply(getLang("success", amount, stock, totalCost, wallet));
  }
};
