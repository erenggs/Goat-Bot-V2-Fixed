const axios = require("axios");

module.exports = {
  config: {
    name: "google",
    aliases: ["gsearch", "googlesearch"],
    version: "1.0",
    author: "eran",
    countDown: 10,
    role: 0, // everyone can use
    shortDescription: "🔍 Search Google from chat",
    longDescription: "Searches Google for your query and returns the top result or multiple results.",
    category: "Utility",
  },

  run: async ({ api, event, args }) => {
    try {
      if (!args[0]) return api.sendMessage("❌ Please provide a search query.", event.threadID);

      const query = args.join(" ");

      // Replace with your Google Custom Search API Key and CX (Search Engine ID)
      const API_KEY = "YOUR_GOOGLE_API_KEY";
      const CX = "YOUR_SEARCH_ENGINE_ID";
      const url = `https://www.googleapis.com/customsearch/v1?key=${API_KEY}&cx=${CX}&q=${encodeURIComponent(query)}`;

      const response = await axios.get(url);
      const items = response.data.items;

      if (!items || items.length === 0) {
        return api.sendMessage(`❌ No results found for "${query}".`, event.threadID);
      }

      // Prepare top 3 results
      let message = `🔍 Google search results for: "${query}"\n\n`;
      items.slice(0, 3).forEach((item, index) => {
        message += `${index + 1}. ${item.title}\n${item.link}\n${item.snippet}\n\n`;
      });

      return api.sendMessage(message.trim(), event.threadID);

    } catch (err) {
      console.error(err);
      return api.sendMessage("❌ Something went wrong while searching Google.", event.threadID);
    }
  },
};
