const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "mj3",
    version: "1.0",
    author: "eran",
    countDown: 5,
    role: 0,
    shortDescription: "Generate AI image",
    longDescription: "Generate an AI image using prompt via Midjourney API",
    category: "image",
    guide: {
      en: "{pn} prompt for image"
    }
  },

  onStart: async function ({ message, args, event }) {
    const prompt = args.join(" ");
    if (!prompt) {
      return message.reply("❌ Please provide a prompt.\nExample: mj3 anime boy in cyberpunk city");
    }

    const apiUrl = `https://api.nijiu.com/mj?prompt=${encodeURIComponent(prompt)}`; // Replace with your own MJ3 API if needed

    try {
      const response = await axios.get(apiUrl);
      const imageUrl = response.data.url || response.data.image || response.data.result;

      if (!imageUrl) {
        return message.reply("❌ Failed to get image URL from API.");
      }

      const imagePath = path.join(__dirname, "cache", `${event.threadID}_mj3.png`);
      const imgRes = await axios.get(imageUrl, { responseType: "arraybuffer" });

      await fs.ensureDir(path.dirname(imagePath));
      fs.writeFileSync(imagePath, imgRes.data);

      message.reply({
        body: `🖼 Prompt: ${prompt}`,
        attachment: fs.createReadStream(imagePath)
      }, () => fs.unlinkSync(imagePath));
    } catch (error) {
      console.error(error);
      message.reply("❌ Failed to generate image. Please try again later.");
    }
  }
};
