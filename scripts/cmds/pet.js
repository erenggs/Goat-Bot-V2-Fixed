const axios = require("axios");
const fs = require("fs").promises;
const path = require("path");

module.exports = {
  config: {
    name: "pet",
    version: "1.2",
    author: "nexo",
    countDown: 5,
    role: 0,
    shortDescription: "🐾 Pet a user",
    longDescription: "Generates a cute pet image or video for a tagged user",
    category: "fun",
    guide: "{pn}pet @user"
  },

  onStart: async function ({ message, event, usersData }) {
    try {
      const mentions = Object.keys(event.mentions || {});
      if (mentions.length === 0) {
        return message.reply("❌ Please tag a user to pet!");
      }

      const userid = mentions[0];
      // Using waifu.pics API for 'pat' images (works with gif or jpg)
      const apiUrl = `https://api.waifu.pics/sfw/pat`;

      // Ensure cache directory exists
      const cacheDir = path.join(__dirname, "cache");
      await fs.mkdir(cacheDir, { recursive: true });

      // Fetch image url from API
      const { data } = await axios.get(apiUrl);

      if (!data || !data.url) {
        return message.reply("⚠️ Failed to get pet image. Try again later.");
      }

      const imageUrl = data.url;
      const extMatch = imageUrl.match(/\.(gif|mp4|png|jpg|jpeg|webp)(\?|$)/i);
      const ext = extMatch ? extMatch[1] : "jpg";

      // Download image
      const res = await axios.get(imageUrl, { responseType: "arraybuffer" });
      const filePath = path.join(cacheDir, `pet_${userid}.${ext}`);
      await fs.writeFile(filePath, res.data);

      const name = await usersData.getName(userid);

      await message.reply({
        body: `🐾 You petted ${name}!`,
        attachment: await fs.readFile(filePath).then(data => Buffer.from(data))
      });

      await fs.unlink(filePath);

    } catch (error) {
      console.error("❌ Pet command error:", error);
      message.reply("⚠️ Failed to generate pet image/video. Please try again later.");
    }
  }
};
