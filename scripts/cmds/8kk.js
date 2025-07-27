const axios = require("axios");

module.exports = {
  config: {
    name: "8kk",
    aliases: ["anime8k", "8kupscale"],
    version: "1.0",
    role: 0,
    author: "Eran",
    countDown: 5,
    longDescription: "Upscale anime images to 8K resolution.",
    category: "image",
    guide: {
      en: "${pn} reply to an anime image to upscale it to 8K resolution."
    }
  },
  onStart: async function ({ message, event }) {
    if (!event.messageReply || !event.messageReply.attachments || !event.messageReply.attachments[0]) {
      return message.reply("❗Please reply to an anime image to upscale it to 8K.");
    }

    const imgurl = encodeURIComponent(event.messageReply.attachments[0].url);
    const noobs = "xyz";
    const upscaleUrl = `https://smfahim.${noobs}/anime8k?url=${imgurl}`;

    message.reply("🎌 Upscaling anime image to 8K... Please wait.", async (err, info) => {
      try {
        const { data: { image } } = await axios.get(upscaleUrl);
        const attachment = await global.utils.getStreamFromURL(image, "anime-upscaled-8k.png");

        message.reply({
          body: "✨ Here's your 8K upscaled anime image:",
          attachment: attachment
        });

        let processingMsgID = info.messageID;
        message.unsend(processingMsgID);

      } catch (error) {
        console.error("Anime 8K Upscale Error:", error);
        message.reply("❌ Failed to upscale the anime image to 8K. Try again later.");
      }
    });
  }
};
