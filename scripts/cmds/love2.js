const axios = require("axios");

module.exports = {
  config: {
    name: "love2",
    version: "1.0",
    author: "eran",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "❤️ Love calculator",
    },
    longDescription: {
      en: "Check love percentage between two people",
    },
    category: "fun",
    guide: {
      en: "{pn} [name1] [name2]",
    },
  },

  onStart: async function ({ message, args }) {
    if (args.length < 2) {
      return message.reply("❌ Please provide two names.\nExample: love Rose Jack");
    }

    const name1 = args[0];
    const name2 = args.slice(1).join(" ");

    // Calculate a fake love percentage (can use any logic)
    const lovePercent = Math.floor(Math.random() * 101);

    const hearts = "💖".repeat(Math.floor(lovePercent / 10));
    const result = `❤️ Love match between *${name1}* and *${name2}*:\n\n💘 ${lovePercent}%\n${hearts}`;

    message.reply(result);
  },
};
