const axios = require("axios");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "animix",
    aliases: ["animixpic", "a"],
    version: "1.0",
    author: "eran",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Send a random animix-style anime photo"
    },
    longDescription: {
      en: "Fetch and send a random animix anime-style image from an online API source"
    },
    category: "image",
    guide: {
      en: "{p}animix"
    }
  },

  onStart: async function ({ message }) {
    try {
      const res = await axios.get("https://api.waifu.pics/sfw/waifu"); // Example source
      const imgURL = res.data.url;

      const path = __dirname + `/cache/animix.jpg`;
      const image = await axios.get(imgURL, { responseType: "arraybuffer" });
      await fs.outputFile(path, image.data);

      message.reply({ body: "🌸 Here's your Animix image!", attachment: fs.createReadStream(path) });
    } catch (error) {
      console.error(error);
      message.reply("❌ Failed to fetch Animix image. Please try again.");
    }
  }
};
