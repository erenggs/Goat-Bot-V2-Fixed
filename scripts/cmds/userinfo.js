const axios = require("axios");

module.exports = {
  config: {
    name: "userinfo",
    version: "1.0",
    author: "eran",
    countDown: 5,
    role: 0,
    shortDescription: "Show user info",
    longDescription: "Displays name, gender, UID, and profile link of mentioned or sender user",
    category: "info"
  },

  onStart: async function ({ message, event, usersData }) {
    const mention = Object.keys(event.mentions)[0];
    const uid = mention || event.senderID;

    try {
      const userData = await usersData.get(uid);

      const name = userData.name || "Unknown";
      const gender = userData.gender || "Not set";
      const money = userData.money || 0;
      const exp = userData.exp || 0;

      const profileLink = `https://facebook.com/${uid}`;

      const msg = `🧑‍💼 𝗨𝘀𝗲𝗿 𝗜𝗻𝗳𝗼:
👤 𝗡𝗮𝗺𝗲: ${name}
🔗 𝗣𝗿𝗼𝗳𝗶𝗹𝗲: ${profileLink}
🆔 𝗨𝗜𝗗: ${uid}
🚻 𝗚𝗲𝗻𝗱𝗲𝗿: ${gender}
💰 𝗖𝗼𝗶𝗻𝘀: ${money}
⭐ 𝗘𝘅𝗽: ${exp}`;

      message.reply(msg);

    } catch (error) {
      console.error(error);
      message.reply("❌ Failed to fetch user info.");
    }
  }
};
