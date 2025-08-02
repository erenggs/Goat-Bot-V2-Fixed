module.exports = {
  config: {
    name: "banklotterydraw",
    aliases: ["ballotterydraw", "buyticket", "lotto"],
    version: "4.0",
    author: "Eran",
    countDown: 5,
    role: 1, // Require admin for draw, normal users for buy
    description: {
      en: "Buy lottery tickets or admin draws winner",
      vi: "Mua vé số hoặc admin bốc thăm trúng thưởng"
    },
    category: "economy",
    guide: {
      en: "{pn} buy <number> — Buy tickets ($1000 each)\n{pn} draw — Admin only: draw winner",
      vi: "{pn} buy <số lượng> — Mua vé số ($1000 mỗi vé)\n{pn} draw — Chỉ admin: bốc thăm trúng thưởng"
    }
  },

  langs: {
    en: {
      invalidAmount: "❌ Enter a valid number of tickets (>0).",
      notEnough: "😥 You don't have enough money. Needed: %1$, You have: %2$",
      maxTickets: "⚠️ You can buy up to %1 tickets at once.",
      buySuccess: "🎉 You bought %1 lottery ticket(s) for %2$. Good luck!",
      noTickets: "❌ No tickets sold yet, cannot draw.",
      drawWinner: "🏆 Congratulations %1! You won the lottery prize of %2$!",
      drawNoWinner: "❌ No winner could be determined.",
      noPermission: "❌ You do not have permission to draw the lottery."
    },
    vi: {
      invalidAmount: "❌ Vui lòng nhập số vé hợp lệ (>0).",
      notEnough: "😥 Bạn không đủ tiền. Cần: %1$, Bạn có: %2$",
      maxTickets: "⚠️ Bạn có thể mua tối đa %1 vé mỗi lần.",
      buySuccess: "🎉 Bạn đã mua %1 vé số với giá %2$. Chúc may mắn!",
      noTickets: "❌ Chưa có vé nào được bán, không thể bốc thăm.",
      drawWinner: "🏆 Chúc mừng %1! Bạn đã trúng thưởng %2$!",
      drawNoWinner: "❌ Không thể tìm thấy người thắng cuộc.",
      noPermission: "❌ Bạn không có quyền bốc thăm xổ số."
    }
  },

  ticketPrice: 1000,
  maxTicketsPerBuy: 10,
  lotteryPrize: 100000,

  // In-memory or persistent storage key
  storageKey: "lotteryData",

  onStart: async function ({ message, args, usersData, event, getLang, api }) {
    if (args.length === 0) {
      return message.reply(getLang("invalidAmount"));
    }

    const subCmd = args[0].toLowerCase();

    // Get global lottery data from global or persistent storage
    // Using usersData with special key for demo, you may want a dedicated global DB
    let lotteryData = await usersData.get(this.storageKey) || { tickets: {}, totalTickets: 0 };

    if (subCmd === "buy") {
      // Buy tickets
      const amount = parseInt(args[1]);
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
      await usersData.set(uid, userData);

      // Update lottery tickets
      lotteryData.tickets[uid] = (lotteryData.tickets[uid] || 0) + amount;
      lotteryData.totalTickets += amount;

      await usersData.set(this.storageKey, lotteryData);

      return message.reply(getLang("buySuccess", amount, totalCost));
    }
    else if (subCmd === "draw") {
      // Admin only check
      if (event.isGroup && !event.participant) return message.reply(getLang("noPermission"));
      // Or check role permission (role 1 is admin in config)
      if (event.role < 1) return message.reply(getLang("noPermission"));

      if (lotteryData.totalTickets === 0) return message.reply(getLang("noTickets"));

      // Weighted random winner by ticket count
      const entries = Object.entries(lotteryData.tickets);
      let cumulative = 0;
      const weightedArray = [];

      for (const [uid, count] of entries) {
        for (let i = 0; i < count; i++) {
          weightedArray.push(uid);
        }
      }

      if (weightedArray.length === 0)
        return message.reply(getLang("drawNoWinner"));

      const winnerUID = weightedArray[Math.floor(Math.random() * weightedArray.length)];
      const winnerData = await usersData.get(winnerUID);

      // Award prize
      winnerData.money = (winnerData.money || 0) + this.lotteryPrize;
      await usersData.set(winnerUID, winnerData);

      // Reset lottery
      lotteryData = { tickets: {}, totalTickets: 0 };
      await usersData.set(this.storageKey, lotteryData);

      // Get winner name from mention or fallback to ID
      let winnerName = winnerData.name || winnerUID;
      if (event.threadID && api && api.getUserInfo) {
        try {
          const userInfo = await api.getUserInfo(winnerUID);
          if (userInfo && userInfo[winnerUID]) winnerName = userInfo[winnerUID].name;
        } catch {}
      }

      return message.reply(getLang("drawWinner", winnerName, this.lotteryPrize));
    }
    else {
      return message.reply(getLang("invalidAmount"));
    }
  }
};
