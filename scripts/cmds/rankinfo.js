module.exports = {
  config: {
    name: "rankinfo",
    version: "1.0",
    author: "eran",
    countDown: 5,
    role: 0,
    shortDescription: "Show your rank info",
    longDescription: "Displays user's EXP, level, coins, and global rank (if available)",
    category: "info"
  },

  onStart: async function ({ message, event, usersData, threadsData }) {
    const mention = Object.keys(event.mentions)[0];
    const uid = mention || event.senderID;

    try {
      const userData = await usersData.get(uid);
      const name = userData.name || "Unknown";
      const exp = userData.exp || 0;
      const money = userData.money || 0;
      const level = Math.floor(exp / 100); // Customize EXP-to-level logic

      // Rank among all users (optional)
      const allUsers = await usersData.getAll();
      const sortedUsers = allUsers.sort((a, b) => (b.exp || 0) - (a.exp || 0));
      const rank = sortedUsers.findIndex(user => user.userID === uid) + 1;

      const msg = `🏅 𝗥𝗮𝗻𝗸 𝗜𝗻𝗳𝗼:
👤 𝗡𝗮𝗺𝗲: ${name}
🆔 𝗨𝗜𝗗: ${uid}
⭐ 𝗟𝗲𝘃𝗲𝗹: ${level}
⚡ 𝗘𝗫𝗣: ${exp}
💰 𝗖𝗼𝗶𝗻𝘀: ${money}
🏆 𝗚𝗹𝗼𝗯𝗮𝗹 𝗥𝗮𝗻𝗸: #${rank}`;

      message.reply(msg);

    } catch (err) {
      console.error(err);
      message.reply("❌ Failed to load rank info.");
    }
  }
};
