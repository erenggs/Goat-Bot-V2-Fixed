const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

// JSON file to store user stats
const dataPath = path.join(__dirname, "trainData.json");
const cooldowns = new Map();

// Load or initialize data
let userData = {};
if (fs.existsSync(dataPath)) {
  userData = fs.readJsonSync(dataPath);
} else {
  fs.writeJsonSync(dataPath, {});
}

module.exports = {
  config: {
    name: "train",
    aliases: ["exercise", "practice"],
    version: "1.1",
    author: "eran",
    countDown: 10,
    role: 0,
    description: "Train your character or pet to gain experience and level up",
    category: "game",
  },

  run: async ({ api, event, args }) => {
    try {
      const userID = event.senderID;
      const now = Date.now();

      // Check cooldown
      if (cooldowns.has(userID)) {
        const expiration = cooldowns.get(userID) + 1000 * 10; // 10 sec
        if (now < expiration) {
          const remaining = Math.ceil((expiration - now) / 1000);
          return api.sendMessage(`⏳ You must wait ${remaining}s before training again.`, event.threadID);
        }
      }

      // Initialize user stats if not exist
      if (!userData[userID]) {
        userData[userID] = { xp: 0, level: 1 };
      }

      // Internal logic
      const xpGained = Math.floor(Math.random() * 20) + 5; // 5-25 XP
      const success = Math.random() > 0.1; // 90% success

      let message = `🏋️ <@${userID}> starts training!\n`;

      if (success) {
        userData[userID].xp += xpGained;
        message += `✅ Training successful! XP gained: ${xpGained}\n`;

        // Level-up check (example: 100 XP per level)
        const nextLevelXP = userData[userID].level * 100;
        if (userData[userID].xp >= nextLevelXP) {
          userData[userID].level += 1;
          userData[userID].xp -= nextLevelXP;
          message += `🎉 Congrats! You leveled up to Level ${userData[userID].level}!`;
        } else {
          message += `Current XP: ${userData[userID].xp}/${nextLevelXP}`;
        }
      } else {
        message += `❌ Training failed! No XP gained this time.`;
      }

      // Save data
      fs.writeJsonSync(dataPath, userData, { spaces: 2 });

      // Send message with mention
      api.sendMessage({ body: message, mentions: [{ tag: `<@${userID}>`, id: userID }] }, event.threadID);

      // Set cooldown
      cooldowns.set(userID, now);

    } catch (err) {
      console.error(err);
      api.sendMessage("❌ Error during training.", event.threadID);
    }
  },
};
