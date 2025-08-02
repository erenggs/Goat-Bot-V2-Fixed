const axios = require("axios");

module.exports = {
  config: {
    name: "hubby",
    aliases: ["boy", "husband"],
    version: "1.0",
    author: "eran",
    countDown: 5,
    role: 0,
    shortDescription: "Send random anime boy (hubby) GIF",
    longDescription: "Get male-only anime GIFs like hug, kiss, dance, etc.",
    category: "anime",
    guide: "{pn} [category]\nExample: {pn} hug, kiss, dance, smile"
  },

  onStart: async function ({ message, args }) {
    const category = args.join(" ").trim() || "hug";

    try {
      const res = await axios.get(`https://api.hubby.pics/sfw/${category}`);
      const url = res.data.url;

      if (!url || !url.endsWith(".gif")) {
        return message.reply("⚠️ No GIF found for this category.\nTry: hug, kiss, dance, smile, pat, wink");
      }

      const form = {
        body: `💘 𝙷𝚄𝙱𝙱𝚈 𝙶𝙸𝙵\n📁 Category: ${category}`,
        attachment: await global.utils.getStreamFromURL(url)
      };

      message.reply(form);

    } catch (e) {
      message.reply("😢 Hubby not found.\nValid categories: hug, kiss, pat, dance, wink, cry, smile, cuddle");
    }
  }
};
