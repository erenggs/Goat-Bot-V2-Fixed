const axios = require("axios");

module.exports = {
  config: {
    name: "ffrank",
    aliases: ["rankff", "fflevel"],
    version: "1.0",
    author: "eran",
    countDown: 10,
    role: 0, // 0 = everyone can use
    shortDescription: "🏆 Check Free Fire player rank",
    longDescription: "Shows the current rank, tier, and performance stats of a Free Fire player",
    category: "game",
  },

  onStart: async function ({ api, event, args }) {
    const user = args[0];
    if (!user) return api.sendMessage("⚠️ Please provide a Free Fire username or ID!", event.threadID);

    try {
      // Replace this URL with your working Free Fire API
      const response = await axios.get(`https://api.example.com/ffrank?user=${encodeURIComponent(user)}`);
      const data = response.data;

      if (!data || data.error) {
        return api.sendMessage("❌ Player not found or API error!", event.threadID);
      }

      const rankMessage = `
🎮 Free Fire Rank Info
👤 Player: ${data.username}
🏅 Rank: ${data.rank}
⭐ Tier: ${data.tier}
🔥 Kills: ${data.kills}
💀 Deaths: ${data.deaths}
🕹️ Matches: ${data.matches}
      `;
      return api.sendMessage(rankMessage, event.threadID);
    } catch (err) {
      console.error(err);
      return api.sendMessage("❌ Failed to fetch data. Try again later!", event.threadID);
    }
  },
};
