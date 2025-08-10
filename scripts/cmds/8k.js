const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "upscale",
    aliases: ["8k", "8hd", "8kupscale"],
    version: "1.6",
    role: 2,
    author: "Eran",
    countDown:20,
    shortDescription: "📸 Upscale images to 4K or 8K (VIP only)",
    longDescription: "✨ Enhances and upscales an image to 4K or 8K resolution using an external API. VIP users only.",
    category: "image",
    guide: {
      en: "💡 {pn} [4k|8k] (reply to an image)"
    }
  },

  onStart: async function ({ message, event, args }) {
    try {
      // Load VIP list
      const vipFile = path.join(__dirname, "vip.json");
      let vipList = [];
      if (fs.existsSync(vipFile)) {
        vipList = JSON.parse(fs.readFileSync(vipFile, "utf8"));
      } else {
        fs.writeFileSync(vipFile, JSON.stringify([]));
      }

      // VIP check
      if (!vipList.includes(event.senderID)) {
        return message.reply("🚫 **VIP Access Only!**\n💎 This feature is for **VIP users**. Contact an admin to get access.");
      }

      // Validate replied image
      if (
        !event.messageReply ||
        !event.messageReply.attachments ||
        event.messageReply.attachments.length === 0 ||
        event.messageReply.attachments[0].type !== "photo"
      ) {
        return message.reply("⚠️ Please reply to a **valid image** 🖼️ to upscale it.");
      }

      // Check quality argument
      const quality = (args[0] || "4k").toLowerCase();
      if (!["8k", "8k"].includes(quality)) {
        return message.reply("⚠️ Invalid quality! Use `8k` or `8k` 🎯.");
      }

      const imgUrl = encodeURIComponent(event.messageReply.attachments[0].url);
      const apiDomain = "smfahim.xyz"; // Your API base domain
      const upscaleUrl = `https://${apiDomain}/${quality}?url=${imgUrl}`;

      // Notify processing
      const processingMsg = await message.reply(`⏳ Upscaling your image to **${quality.toUpperCase()}**... Please wait 🖌️`);

      // Call API
      const { data } = await axios.get(upscaleUrl);

      if (!data || !data.image) {
        return message.reply("❌ Failed to upscale image. API did not return an image 😔");
      }

      // Send upscaled image
      const attachment = await global.utils.getStreamFromURL(data.image, `${quality}-upscaled.png`);
      await message.reply({
        body: `✅ **Done!**\n📸 Here’s your **${quality.toUpperCase()}** upscaled image! 🏆`,
        attachment
      });

      // Remove "processing" message
      message.unsend(processingMsg.messageID);

    } catch (error) {
      console.error("❌ Upscale Error:", error.message);
      message.reply("💥 Oops! Something went wrong while upscaling your image. Please try again later 🚑");
    }
  }
};
