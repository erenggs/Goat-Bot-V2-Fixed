const axios = require("axios");

module.exports = {
  config: {
    name: "weekly",
    aliases: ["week", "w"],
    version: "1.0",
    author: "eran",
    countDown: 10,
    role: 0, // 0 = everyone, 1 = mods, 2 = admin
    description: "Claim your weekly reward or fetch weekly data",
    category: "economy",
  },

  run: async ({ api, event, args }) => {
    try {
      const userID = event.senderID;

      // Example: Call API to fetch weekly reward
      const response = await axios.get(`https://example-api.com/weekly?user=${userID}`);
      const data = response.data;

      if (!data || data.status === "error") {
        return api.sendMessage("❌ No weekly data found or already claimed.", event.threadID);
      }

      // Construct response message
      let message = `✅ Weekly Reward Claimed!\n\n`;
      message += `User: ${data.user || "N/A"}\n`;
      message += `Amount: ${data.amount || "0"} coins\n`;
      message += `Next Claim: ${data.nextClaim || "7 days later"}`;

      api.sendMessage(message, event.threadID);

    } catch (err) {
      console.error(err);
      api.sendMessage("❌ Error fetching weekly reward.", event.threadID);
    }
  },
};
