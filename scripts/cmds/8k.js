const axios = require("axios");

module.exports = {
  config: {
    name: "8k",
    aliases: ["8kupscale"],
    version: "1.0",
    role: 0,
    author: "Eran",
    countDown: 5,
    longDescription: "Upscale images to 8K resolution.",
    category: "image",
    guide: {
      en: "${pn} reply to an image to upscale it to 8K resolution."
    }
  },
  onStart: async function ({ message, event }) {
    if (!event.messageReply || !event.messageReply.attachments || !event.messageReply.attachments[0]) {
      return message.reply("❗Please reply to an image to upscale it to 8K.");
    }

    const imgurl = encodeURIComponent(event.messageReply.attachments[0].url);
    const noobs = "xyz";
    const upscaleUrl = `https://smfahim.${noobs}/8k?url=${imgurl}`;

    message.reply("🔄| Upscaling to 8K... Please wait a moment.", async (err, info) => {
      try {
        const { data: { image } } = await axios.get(upscaleUrl);
        const attachment = await global.utils.getStreamFromURL(image, "upscaled-8k-image.png");

        message.reply({
          body: "✅| Here is your 8K upscaled image:",
          attachment: attachment
        });

        let processingMsgID = info.messageID;
        message.unsend(processingMsgID);

      } catch (error) {
        console.error("8K Upscale Error:", error);
        message.reply("❌| Failed to upscale the image to 8K. Please try again later.");
      }
    });
  }
};
