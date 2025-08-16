const fs = require("fs-extra");
const path = require("path");

// Path to the JSON file storing user XP and levels
const dataPath = path.join(__dirname, "trainData.json");

// Load or initialize user data
let userData = {};
if (fs.existsSync(dataPath)) {
  userData = fs.readJsonSync(dataPath);
} else {
  fs.writeJsonSync(dataPath, {});
}

module.exports = {
  config: {
    name: "levelup",
    aliases: ["lvl", "level"],
    version: "1.1",
    author: "eran",
    countDown: 10,
    role: 0, // 0 = everyone
    description: "Check your level and XP, or manually level up if ready",
    category: "game",
  },

  run: async ({ api, event, args }) => {
    try {
      const userID = event.senderID;

      // Initialize user stats if missing
      if (!userData[userID]) {
        userData[userID] = { xp: 0, level: 1 };
      }

      const user = userData[userID];
      const nextLevelXP = user.level * 100;

      let message = `📊 <@${userID}>'s Level Info:\n`;
      message += `Level: ${user.level}\n`;
      message += `XP: ${user.xp}/${nextLevelXP}\n`;

      // Check if user can level up
      if (user.xp >= nextLevelXP) {
        user.level += 1;
        user.xp -= nextLevelXP;
        message += `🎉 Congrats! You leveled up to Level ${user.level}!`;
        fs.writeJsonSync(dataPath, userData, { spaces: 2 });
      }

      // Send message with mention
      api.sendMessage(
        { body: message, mentions: [{ tag: `<@${userID}>`, id: userID }] },
        event.threadID
      );

    } catch (err) {
      console.error(err);
      api.sendMessage("❌ Error fetching level info.", event.threadID);
    }
  },
};
