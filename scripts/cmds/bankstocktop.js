module.exports = {
  config: {
    name: "bankstocktop",
    aliases: ["stocktop", "baltopstocks"],
    version: "3.0",
    author: "Eran",
    countDown: 5,
    role: 0,
    description: {
      en: "Show top 10 users with the most stocks",
      vi: "Hiển thị 10 người dùng có nhiều cổ phiếu nhất"
    },
    category: "economy",
    guide: {
      en: "{pn} — Show top 10 stock holders",
      vi: "{pn} — Hiển thị 10 người có nhiều cổ phiếu nhất"
    }
  },

  langs: {
    en: {
      header: "📈 Top 10 users with most stocks:",
      line: "%1. %2 (UID: %3) — Total Shares: %4",
      noData: "❌ No users with stock data found."
    },
    vi: {
      header: "📈 Top 10 người dùng có nhiều cổ phiếu nhất:",
      line: "%1. %2 (UID: %3) — Tổng cổ phiếu: %4",
      noData: "❌ Không tìm thấy dữ liệu cổ phiếu của người dùng."
    }
  },

  onStart: async function ({ message, usersData, getLang, api }) {
    // Get all users with investments
    const allUsers = await usersData.getAll();

    // Filter users who have any stocks
    let stockHolders = allUsers.filter(user => user.value.investments && Object.keys(user.value.investments).length > 0);

    if (stockHolders.length === 0) {
      return message.reply(getLang("noData"));
    }

    // Calculate total shares per user
    stockHolders = stockHolders.map(user => {
      const investments = user.value.investments;
      const totalShares = Object.values(investments).reduce((a, b) => a + b, 0);
      return {
        uid: user.key,
        name: user.value.name || user.key,
        totalShares
      };
    });

    // Sort descending by totalShares
    stockHolders.sort((a, b) => b.totalShares - a.totalShares);

    // Take top 10
    const top10 = stockHolders.slice(0, 10);

    // Try to get real names if possible via API
    const promises = top10.map(async (u) => {
      try {
        const info = await api.getUserInfo(u.uid);
        if (info && info[u.uid]) u.name = info[u.uid].name || u.name;
      } catch {}
      return u;
    });

    const results = await Promise.all(promises);

    // Build reply text
    let text = getLang("header") + "\n\n";
    results.forEach((u, i) => {
      text += getLang("line", i + 1, u.name, u.uid, u.totalShares) + "\n";
    });

    return message.reply(text.trim());
  }
};
