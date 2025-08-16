const fs = require("fs-extra");
const path = require("path");

// Path to JSON file storing premium users
const dataPath = path.join(__dirname, "premiumUsers.json");

// Load or initialize data
let premiumUsers = {};
if (fs.existsSync(dataPath)) {
  premiumUsers = fs.readJsonSync(dataPath);
} else {
  fs.writeJsonSync(dataPath, {});
}

module.exports = {
  config: {
    name: "premium",
    aliases: ["vp", "pr"],
    version: "1.2",
    author: "eran",
    countDown: 10,
    role: 2, // Admin only
    description: "✨ Manage or check premium/VIP users",
    category: "tools",
  },

  run: async ({ api, event, args }) => {
    try {
      const senderID = event.senderID;
      const command = args[0]?.toLowerCase(); // add, remove, check
      const targetID = args[1]; // user ID

      if (!command) {
        return api.sendMessage("❌ Oops! Please specify a command: `add`, `remove`, or `check`.", event.threadID);
      }

      switch (command) {
        case "add":
          if (!targetID) return api.sendMessage("❌ Please provide the user ID to add.", event.threadID);
          if (premiumUsers[targetID]) {
            return api.sendMessage(`⚠️ User ${targetID} is already enjoying premium perks!`, event.threadID);
          }
          premiumUsers[targetID] = true;
          fs.writeJsonSync(dataPath, premiumUsers, { spaces: 2 });
          api.sendMessage(`✨ Success! User ${targetID} is now a premium member! 🎉`, event.threadID);
          break;

        case "remove":
          if (!targetID) return api.sendMessage("❌ Please provide the user ID to remove.", event.threadID);
          if (premiumUsers[targetID]) {
            delete premiumUsers[targetID];
            fs.writeJsonSync(dataPath, premiumUsers, { spaces: 2 });
            api.sendMessage(`🗑️ User ${targetID} has been removed from premium. 😢`, event.threadID);
          } else {
            api.sendMessage(`❌ User ${targetID} is not a premium member.`, event.threadID);
          }
          break;

        case "check":
          if (!targetID) return api.sendMessage("❌ Please provide the user ID to check.", event.threadID);
          const status = premiumUsers[targetID]
            ? "🌟 This user is a Premium VIP! 🎉"
            : "❌ This user does not have premium access.";
          api.sendMessage(`User ${targetID}: ${status}`, event.threadID);
          break;

        default:
          api.sendMessage("❌ Invalid command! Use `add`, `remove`, or `check`.", event.threadID);
          break;
      }
    } catch (err) {
      console.error(err);
      api.sendMessage("❌ Something went wrong while managing premium users. ⚠️", event.threadID);
    }
  },
};
