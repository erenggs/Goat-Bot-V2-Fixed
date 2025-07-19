const axios = require("axios");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "animeme",
    aliases: ["anime_meme", "memesan"],
    version: "1.0",
    author: "eran",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Send a random anime meme",
    },
    longDescription: {
      en: "Fetches and sends a random anime meme from an anime meme API.",
    },
    category: "fun",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ message }) {
    try {
      const res = await axios.get("https://meme-api.com/gimme/anime"); // Example meme API
      const meme = res.data;

      message.reply({
        body: `${meme.title}\n👍 ${meme.ups} | 🧑‍💬 r/${meme.subreddit}`,
        attachment: await global.utils.getStreamFromURL(meme.url)
      });
    } catch (error) {
      console.error(error);
      message.reply("❌ Failed to fetch an anime meme. Try again later.");
    }
  }
};
