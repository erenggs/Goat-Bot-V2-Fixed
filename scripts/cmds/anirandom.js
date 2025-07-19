const axios = require("axios");

module.exports = {
  config: {
    name: "anirandom",
    aliases: ["animepic", "arandom"],
    version: "1.0",
    author: "eran",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Send a random anime image",
    },
    longDescription: {
      en: "Fetches and sends a random anime character image from an API",
    },
    category: "anime",
    guide: {
      en: "{pn} - get a random anime character image",
    },
  },

  onStart: async function ({ message }) {
    try {
      const res = await axios.get("https://api.waifu.pics/sfw/waifu");
      const imgURL = res.data.url;

      message.reply({
        body: "✨ Here's your random anime character!",
        attachment: await global.utils.getStreamFromURL(imgURL),
      });
    } catch (error) {
      console.error(error);
      message.reply("❌ Failed to fetch anime image. Please try again later.");
    }
  },
};
