module.exports = {
  config: {
    name: "banklottery",
    aliases: ["ballottery", "buyticket", "lotto"],
    version: "3.0",
    author: "Eran",
    countDown: 5,
    role: 0,
    description: {
      en: "Buy lottery tickets ($1000 each)",
      vi: "Mua vé số ($1000 mỗi vé)"
    },
    category: "economy",
    guide: {
      en: "{pn} <number> — Buy <number> of lottery tickets (each costs $1000)",
      vi: "{pn} <số lượng> — Mua <số lượng> vé số (mỗi vé giá $1000)"
    }
  },

  langs: {
    en: {
      invalidAmount: "❌ Enter a valid number of tickets (>0).",
      notEnough: "😥 You don't have enough money. Needed: %1$, You have: %2$",
      success: "🎉 You bought %1 lottery ticket(s) for %2$. Good luck!",
      maxTickets: "⚠️ You can buy up to %1 tickets at once."
    },
    vi: {
      invalidAmount: "❌ Vui lòng nhập số vé hợp lệ (>0).",
      notEnough: "😥 Bạn không đủ tiền. Cần: %1$, Bạn có: %2$",
      success: "🎉 Bạn đã mua %1 vé số với giá %2$. Chúc may mắn!",
      maxTickets: "⚠️ Bạn có thể mua tối đa %1 vé mỗi lần."
    }
  },

  ticketPrice: 1000,
  maxTicketsPerBuy: 10,

  onStart: async function ({ message, args, usersData, event, getLang }) {
    const amount = parseInt(args[0]);
    if (isNaN(amount) || amount <= 0)
      return message.reply(getLang("invalidAmount"));

    if (amount > this.maxTicketsPerBuy)
      return message.reply(getLang("maxTickets", this.maxTicketsPerBuy));

    const uid = event.senderID;
    const userData = await usersData.get(uid);
    const wallet = userData.money || 0;
    const totalCost = amount * this.ticketPrice;

    if (wallet < totalCost)
      return message.reply(getLang("notEnough", totalCost, wallet));

    // Deduct money
    userData.money = wallet - totalCost;

    // Track tickets (store as count or array)
    userData.lotteryTickets = (userData.lotteryTickets || 0) + amount;

    await usersData.set(uid, userData);

    return message.reply(getLang("success", amount, totalCost));
  }
};
