const axios = require("axios");

module.exports = {
  config: {
    name: "xsapi",
    aliases: ["xs", "api"],
    version: "1.0",
    author: "eran",
    countDown: 10,
    role: 2, // 0 = everyone, 1 = mods, 2 = admin
    description: "Fetch data from XS API",
    category: "tools",
  },

  run: async ({ api, event, args }) => {
    try {
      if (!args[0]) {
        return api.sendMessage("❌ Please provide a query!", event.threadID);
      }

      // Replace with your real XS API endpoint
      const query = encodeURIComponent(args.join(" "));
      const apiUrl = `https://example-xs-api.com/data?query=${query}`;

      const response = await axios.get(apiUrl);
      const data = response.data;

      if (!data || Object.keys(data).length === 0) {
        return api.sendMessage("❌ No results found.", event.threadID);
      }

      // Construct message
      let message = `✅ XS API Result:\n\n`;
      message += `Name: ${data.name || "N/A"}\n`;
      message += `Description: ${data.description || "N/A"}\n`;
      message += `URL: ${data.url || "N/A"}\n`;
      
      // Optional image
      if (data.image) {
        message += `Image: ${data.image}\n`;
      }

      api.sendMessage(message, event.threadID);
    } catch (err) {
      console.error(err);
      api.sendMessage("❌ Error fetching data from XS API.", event.threadID);
    }
  },
};
