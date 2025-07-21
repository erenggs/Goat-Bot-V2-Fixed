const axios = require("axios");

module.exports = {
  config: {
    name: "pic",
    aliases: ["animepic", "pia"],
    version: "1.0",
    author: "eran",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Send a random anime picture"
    },
    longDescription: {
      en: "Fetches and sends a random anime picture using an external API"
    },
    category: "anime",
    guide: {
      en: "{pn} — get a random anime image"
    }
  },

  onStart: async function ({ message }) {
    try {
      // You can switch the API below to other image APIs if preferred
      const response = await axios.get("https://api.waifu.pics/sfw/waifu");
      const imageUrl = response.data.url;

      message.reply({
        body: `「 Here's your waifu 👀 」\nImage URL: ${imageUrl}`,
        attachment: await global.utils.getStreamFromURL(imageUrl)
      });
    } catch (error) {
      console.error("Error fetching anime pic:", error);
      message.send("Sorry, couldn't fetch an anime picture right now. Try again later!");
    }
  }
};
