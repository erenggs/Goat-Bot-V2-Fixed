const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "imagen4",
    aliases: ["img4", "gen4"],
    version: "1.0",
    author: "Yagami",
    countDown: 5,
    role: 0,
    shortDescription: "Generate image using Imagen 4 API",
    longDescription: "Uses Imagen 4 AI to generate an image from a prompt",
    category: "image",
    guide: "{pn} [prompt text]"
  },

  onStart: async function ({ message, args, event }) {
    const prompt = args.join(" ");
    if (!prompt) {
      return message.reply("❌ Please provide a prompt.\n\nExample: imagen4 Eren Yeager in a black tuxedo");
    }

    const apiURL = `https://api.imagen4.ai/generate`; // Replace with real API if needed
    const apiKey = "your_api_key_here"; // Add your real API key

    try {
      message.reply("🖼️ Generating image... Please wait...");

      const response = await axios.post(apiURL, {
        prompt: prompt
      }, {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        responseType: "arraybuffer"
      });

      const imagePath = path.join(__dirname, "cache", `${event.threadID}_${Date.now()}.jpg`);
      fs.writeFileSync(imagePath, Buffer.from(response.data, "binary"));

      return message.reply({
        body: `✅ Here is your image for: ${prompt}`,
        attachment: fs.createReadStream(imagePath)
      }, () => fs.unlinkSync(imagePath));
      
    } catch (error) {
      console.error(error);
      return message.reply("⚠️ Failed to generate image. Please try again later.");
    }
  }
};
