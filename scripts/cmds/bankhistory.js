module.exports = {
  config: {
    name: "bankhistory",
    aliases: ["history", "transaction", "banktrans"],
    version: "3.0",
    author: "Eran",
    countDown: 5,
    role: 0,
    description: {
      en: "View your or tagged user's transaction history",
      vi: "Xem lịch sử giao dịch của bạn hoặc người được tag"
    },
    category: "economy",
    guide: {
      en: "{pn} [@tag] [limit]\nExample: {pn} @user 5",
      vi: "{pn} [@tag] [số lượng]\nVí dụ: {pn} @user 5"
    }
  },

  langs: {
    en: {
      noHistory: "❌ No transaction history found.",
      header: "📜 Transaction history for %1 (last %2):",
      line: "[%1] %2: %3 %4",
      types: {
        deposit: "Deposit",
        withdraw: "Withdraw",
        send: "Sent money",
        receive: "Received money",
        loan: "Loan taken",
        repay: "Loan repaid",
        robSuccess: "Robbery success",
        robFail: "Robbery failed"
      },
      dateFormat: "YYYY-MM-DD HH:mm",
      invalidLimit: "❌ Invalid limit. Please enter a number between 1 and 50."
    },
    vi: {
      noHistory: "❌ Không tìm thấy lịch sử giao dịch.",
      header: "📜 Lịch sử giao dịch của %1 (mới nhất %2):",
      line: "[%1] %2: %3 %4",
      types: {
        deposit: "Gửi tiền",
        withdraw: "Rút tiền",
        send: "Gửi tiền",
        receive: "Nhận tiền",
        loan: "Vay tiền",
        repay: "Trả nợ",
        robSuccess: "Cướp thành công",
        robFail: "Cướp thất bại"
      },
      dateFormat: "YYYY-MM-DD HH:mm",
      invalidLimit: "❌ Số lượng không hợp lệ. Vui lòng nhập số từ 1 đến 50."
    }
  },

  onStart: async function ({ message, event, args, usersData, getLang }) {
    const moment = require("moment");

    let uid = event.senderID;
    let limit = 10; // default history items

    // Check if tagged user exists
    if (Object.keys(event.mentions).length > 0) {
      uid = Object.keys(event.mentions)[0];
      if (args[1]) {
        const num = parseInt(args[1]);
        if (!isNaN(num) && num >= 1 && num <= 50) limit = num;
        else return message.reply(getLang("invalidLimit"));
      }
    } else if (args[0]) {
      const num = parseInt(args[0]);
      if (!isNaN(num) && num >= 1 && num <= 50) limit = num;
      else return message.reply(getLang("invalidLimit"));
    }

    const userData = await usersData.get(uid);
    const transactions = userData.transactions || [];

    if (!transactions.length)
      return message.reply(getLang("noHistory"));

    // Sort newest first
    const sorted = transactions.sort((a, b) => b.date - a.date).slice(0, limit);

    let text = getLang("header", userData.name || "User", sorted.length) + "\n\n";

    for (const tx of sorted) {
      const typeName = getLang("types")[tx.type] || tx.type;
      const dateStr = moment(tx.date).format(getLang("dateFormat"));
      const amount = tx.amount ? `${tx.amount}$` : "";
      const note = tx.note ? `(${tx.note})` : "";
      text += getLang("line", dateStr, typeName, amount, note) + "\n";
    }

    return message.reply(text.trim());
  }
};
