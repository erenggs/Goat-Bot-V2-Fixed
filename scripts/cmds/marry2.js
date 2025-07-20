const axios = require("axios");

module.exports = {
  config: {
    name: "marry2",
    aliases: ["prs", "animewife"],
    version: "1.0",
    author: "eran",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Propose to an anime character" },
    longDescription: { en: "Marry your favorite waifu or husbando!" },
    category: "anime",
    guide: { en: "{p}marry [name]" }
  },

  onStart: async function ({ api, event, args }) {
    const character = args.join(" ") || "Hinata";
    const response = await axios.get(`https://api.waifu.pics/sfw/waifu`);
    const imageUrl = response.data.url;

    api.sendMessage(
      {
        body: `💍 You proposed to ${character}!\nThey said YES! 🎉`,
        attachment: await global.utils.getStreamFromURL(imageUrl),
      },
      event.threadID,
      event.messageID
    );
  }
};
