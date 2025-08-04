const axios = require("axios");

module.exports = {
  config: {
    name: "randomgirl",
    version: "2.0",
    author: "eran",
    countDown: 5,
    role: 0,
    shortDescription: "Send a random anime girl image",
    longDescription: "Sends a random anime girl image using multiple external APIs with failover support.",
    category: "anime",
    guide: "{p}randomgirl [waifu|maid|selfies|uniform|blush|neko]\nDefault: waifu"
  },

  onStart: async function ({ api, event, args }) {
    const categories = ["waifu", "maid", "selfies", "uniform", "blush", "neko"];
    const chosen = args[0]?.toLowerCase() || "waifu";

    if (!categories.includes(chosen)) {
      return api.sendMessage(
        `❌ Invalid category.\n✅ Available: ${categories.join(", ")}`,
        event.threadID,
        event.messageID
      );
    }

    const sources = [
      `https://api.waifu.pics/sfw/${chosen}`,
      `https://api.nekos.dev/api/v3/images/sfw/img/${chosen}?count=1`
    ];

    let imageUrl = null;

    for (const url of sources) {
      try {
        const res = await axios.get(url);
        imageUrl = res.data.url || res.data.data?.[0]?.response?.url;
        if (imageUrl) break;
      } catch (err) {
        console.error(`API failed: ${url}`);
      }
    }

    if (!imageUrl) {
      return api.sendMessage("❌ All APIs failed to fetch an image. Please try again later.", event.threadID, event.messageID);
    }

    return api.sendMessage({
      body: `✨ Here's a random anime girl (${chosen}) for you!`,
      attachment: await global.utils.getStreamFromURL(imageUrl)
    }, event.threadID, event.messageID);
  }
};
