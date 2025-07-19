const axios = require("axios");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "nijiu",
    aliases: ["animegirl", "nijiuimage"],
    version: "1.0",
    author: "eran",
    countDown: 5,
    role: 0,
    shortDescription: "Send random anime girl image",
    longDescription: "Fetches and sends a random anime girl image from an API",
    category: "image",
    guide: "{pn}"
  },

  onStart: async function ({ message }) {
    try {
      const res = await axios.get("https://nekos.life/api/v2/img/waifu"); // or any other anime image API
      const imageURL = res.data.url;

      const imagePath = __dirname + "/cache/nijiu.jpg";
      const imgRes = await axios.get(imageURL, { responseType: "arraybuffer" });
      fs.writeFileSync(imagePath, Buffer.from(imgRes.data, "binary"));

      await message.reply({
        body: "✨ Here's your Nijiu-style anime image!",
        attachment: fs.createReadStream(imagePath)
      });

      fs.unlinkSync(imagePath);
    } catch (error) {
      console.error(error);
      message.reply("❌ Failed to fetch image. Try again later.");
    }
  }
};
