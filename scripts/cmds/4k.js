const axios = require("axios");
const fs = require("fs");

module.exports = {
  config: {
    name: "4k",
    aliases: ["upscale", "hd"],
    version: "1.4",
    role: 0, // Normal role, VIP check handled in code
    author: "Eran",
    countDown: 20,
    shortDescription: "Upscale images to 4K (VIP only)",
    longDescription: "Enhances and upscales an image to 4K resolution using an external API. VIP users only.",
    category: "image",
    guide: {
      en: "{pn} (reply to an image)"
    }
  },

  onStart: async function ({ message, event }) {
    try {
      // Load or create VIP list file
      const vipFile = `${__dirname}/vip.json`;
      let vipList = [];
      if (fs.existsSync(vipFile)) {
        vipList = JSON.parse(fs.readFileSync(vipFile, "utf8"));
      } else {
        fs.writeFileSync(vipFile, JSON.stringify([]));
      }

      // VIP check
      if (!vipList.includes(event.senderID)) {
        return message.reply("🚫 This feature is for **VIP users only**.\n💬 Contact an admin to get VIP access.");
      }

      // Image check
      if (
        !event.messageReply ||
        !event.messageReply.attachments ||
        event.messageReply.attachments.length === 0 ||
        event.messageReply.attachments[0].type !== "photo"
      ) {
        return message.reply("⚠️ Please reply to a **valid image** to upscale it.");
      }

      const imgUrl = encodeURIComponent(event.messageReply.attachments[0].url);
      const apiDomain = "smfahim.xyz"; // API base domain
      const upscaleUrl = `https://${apiDomain}/4k?url=${imgUrl}`;

      // Notify processing
      const processingMsg = await message.reply("🔄 Processing your image to 4K... Please wait.");

      // Call API
      const { data } = await axios.get(upscaleUrl);

      if (!data || !data.image) {
        return message.reply("❌ Failed to upscale image. API did not return an image.");
      }

      // Send upscaled image
      const attachment = await global.utils.getStreamFromURL(data.image, "4k-upscaled.png");
      await message.reply({
        body: "✅ Here’s your **upscaled 4K image** 📸",
        attachment
      });

      // Remove processing message
      message.unsend(processingMsg.messageID);

    } catch (error) {
      console.error("4K Upscale Error:", error.message);
      message.reply("❌ Something went wrong while upscaling your image. Please try again later.");
    }
  }
};
