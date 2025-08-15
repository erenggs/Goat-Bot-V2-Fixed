const axios = require("axios");

module.exports = {
  config: {
    name: "cartoon",
    aliases: ["toon", "cartoonify"],
    version: "1.0",
    author: "eran",
    countDown: 10,
    role: 0, // everyone can use
    shortDescription: "🎨 Turn a photo into a cartoon",
    longDescription: "Converts a user's profile picture or an image URL into a cartoon-style image.",
    category: "Media",
  },

  run: async ({ api, event, args, utils }) => {
    try {
      // Check if image is attached
      let imageUrl = event.messageReply?.attachments?.[0]?.url;
      if (!imageUrl && args[0]) imageUrl = args[0];
      if (!imageUrl) return api.sendMessage("❌ Please reply to an image or provide an image URL.", event.threadID);

      // Example using DeepAI CartoonGAN API
      const response = await axios.post(
        "https://api.deepai.org/api/cartoon-gan",
        { image: imageUrl },
        { headers: { "api-key": "YOUR_DEEPAI_API_KEY" } }
      );

      if (!response.data || !response.data.output_url) {
        return api.sendMessage("❌ Failed to convert image to cartoon.", event.threadID);
      }

      const cartoonUrl = response.data.output_url;
      return api.sendMessage(
        { body: "🎨 Here’s your cartoon image!", attachment: await utils.getStream(cartoonUrl) },
        event.threadID
      );

    } catch (err) {
      console.error(err);
      return api.sendMessage("❌ Something went wrong while processing the cartoon.", event.threadID);
    }
  },
};
