const axios = require("axios");

module.exports = {
  config: {
    name: "aidraw",
    aliases: ["drawai", "artai", "aidrawing"],
    version: "1.0",
    author: "eran",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Get a random AI-generated drawing",
    },
    longDescription: {
      en: "Sends a random AI-generated artwork, such as anime-style or digital painting.",
    },
    category: "image",
    guide: {
      en: "{pn} - Get an AI-generated drawing",
    }
  },

  onStart: async function ({ api, event }) {
    try {
      // Replace this URL with your actual AI drawing endpoint
      const response = await axios.get("https://api.waifu.pics/sfw/waifu");
      const imageUrl = response.data.url;

      // Send the image
      api.sendMessage(
        {
          body: "🎨 Here's your AI-generated drawing!",
          attachment: await global.utils.getStreamFromURL(imageUrl)
        },
        event.threadID,
        event.messageID
      );
    } catch (error) {
      console.error("Error fetching AI drawing:", error);
      api.sendMessage("❌ Failed to fetch AI drawing. Please try again later.", event.threadID, event.messageID);
    }
  }
};
