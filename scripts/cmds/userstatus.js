module.exports = {
  config: {
    name: "userstatus",
    version: "1.0",
    author: "eran",
    countDown: 5,
    role: 0,
    shortDescription: "Check user status",
    longDescription: "Shows a user’s level, coins, exp and other status stats",
    category: "info"
  },

  onStart: async function ({ message, event, usersData }) {
    const mention = Object.keys(event.mentions)[0];
    const uid = mention || event.senderID;

    try {
      const userData = await usersData.get(uid);
      const name = userData.name || "Unknown";
      const coins = userData.money || 0;
      const exp = userData.exp || 0;
      const level = Math.floor(exp / 100); // example level calc: 100exp = 1 level

      const statusMsg = `📊 𝗨𝘀𝗲𝗿 𝗦𝘁𝗮𝘁𝘂𝘀:
👤 𝗡𝗮𝗺𝗲: ${name}
🆔 𝗨𝗜𝗗: ${uid}
⭐ 𝗟𝗲𝘃𝗲𝗹: ${level}
💰 𝗖𝗼𝗶𝗻𝘀: ${coins}
⚡ 𝗘𝘅𝗽: ${exp}`;

      message.reply(statusMsg);

    } catch (err) {
      console.error(err);
      message.reply("❌ Couldn't load user status.");
    }
  }
};
