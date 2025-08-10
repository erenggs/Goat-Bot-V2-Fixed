const axios = require("axios");
const fs = require("fs").promises;
const path = require("path");

module.exports = {
  config: {
    name: "hug3",               // Change this to your command name like "pet", "poke", "kiss", etc.
    version: "1.0",
    author: "eran",
    countDown: 20,
    role: 0,
    shortDescription: "🤗 Hug a user",
    longDescription: "Sends a cute hug image or video for a tagged user",
    category: "fun",
    guide: "{pn}hug @user"
  },

  onStart: async function ({ message, event, usersData }) {
    try {
      // Check for mentions
      const mentions = Object.keys(event.mentions || {});
      if (mentions.length === 0) {
        return message.reply("❌ Please tag a user to hug!");
      }
      const userid = mentions[0];

      // Define the API endpoint for the action
      // Supported endpoints (example): "hug", "poke", "pat", "kiss", "cuddle"
      // For hug2 command, we use "hug" endpoint here:
      const action = "hug";

      // Waifu.pics API URL for SFW action gifs
      const apiUrl = `https://api.waifu.pics/sfw/${action}`;

      // Ensure cache folder exists
      const cacheDir = path.join(__dirname, "cache");
      await fs.mkdir(cacheDir, { recursive: true });

      // Fetch the image url from the API
      const { data } = await axios.get(apiUrl);
      if (!data?.url) return message.reply("⚠️ Failed to fetch image. Try again later.");

      // Get extension from URL
      const extMatch = data.url.match(/\.(gif|mp4|png|jpg|jpeg|webp)(\?|$)/i);
      const ext = extMatch ? extMatch[1] : "jpg";

      // Download the image/gif/video
      const imageResponse = await axios.get(data.url, { responseType: "arraybuffer" });
      const filePath = path.join(cacheDir, `${action}_${userid}.${ext}`);
      await fs.writeFile(filePath, imageResponse.data);

      // Get username or fallback to ID
      const name = await usersData.getName(userid);

      // Send message with image and mention
      await message.reply({
        body: `🤗 You hugged ${name}!`,
        attachment: await fs.readFile(filePath).then(buffer => Buffer.from(buffer))
      });

      // Delete cached file
      await fs.unlink(filePath);

    } catch (error) {
      console.error(`❌ ${this.config.name} command error:`, error);
      message.reply("⚠️ Failed to generate image/video. Please try again later.");
    }
  }
};
