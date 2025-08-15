const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "imaginate",
    aliases: ["im", "aiimage", "render"],
    version: "1.0",
    author: "eran",
    countDown: 10,
    role: 2, // 0 = everyone
    shortDescription: "Generate AI images from text prompts",
    longDescription: "Use AI to generate unique images from your text description.",
    category: "image",
  },

  onStart: async function ({ api, event, args }) {
    if (!args.join(" ")) {
      return api.sendMessage("❌ Please provide a prompt to generate an image.", event.threadID);
    }

    const prompt = args.join(" ");
    const msg = await api.sendMessage("🎨 Generating your AI image...", event.threadID);

    try {
      // Example API call – replace URL & key with your AI image generator service
      const response = await axios.post("https://api.exampleai.com/generate", {
        prompt: prompt,
        size: "1024x1024",
      }, {
        headers: { "Authorization": "Bearer YOUR_API_KEY" }
      });

      const imageURL = response.data.url; // assuming API returns image URL
      const imagePath = path.join(__dirname, "temp_image.png");

      // Download image
      const imageResp = await axios.get(imageURL, { responseType: "arraybuffer" });
      await fs.writeFile(imagePath, imageResp.data);

      // Send image to chat
      await api.sendMessage({ body: `✨ Here is your AI image for:\n"${prompt}"`, attachment: fs.createReadStream(imagePath) }, event.threadID);
      await fs.remove(imagePath);
      await api.unsendMessage(msg.messageID);
    } catch (err) {
      console.error(err);
      api.sendMessage("❌ Failed to generate image. Try again later.", event.threadID);
    }
  }
};
