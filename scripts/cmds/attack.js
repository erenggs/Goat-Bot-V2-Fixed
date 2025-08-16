const axios = require("axios");

// Simple cooldown map
const cooldowns = new Map();

module.exports = {
  config: {
    name: "attack",
    aliases: ["atk", "fight"],
    version: "1.1",
    author: "eran",
    countDown: 10, // default cooldown in seconds
    role: 0, // 0 = everyone
    description: "Attack another user in a battle or game",
    category: "game",
  },

  run: async ({ api, event, args }) => {
    try {
      const attackerID = event.senderID;
      const target = args[0];

      if (!target) {
        return api.sendMessage("❌ Please tag a user to attack!", event.threadID);
      }

      // Check cooldown
      const now = Date.now();
      if (cooldowns.has(attackerID)) {
        const expiration = cooldowns.get(attackerID) + 1000 * 10; // 10 sec
        if (now < expiration) {
          const remaining = Math.ceil((expiration - now) / 1000);
          return api.sendMessage(`⏳ You must wait ${remaining}s before attacking again.`, event.threadID);
        }
      }

      // Internal attack logic
      const damage = Math.floor(Math.random() * 50) + 10; // Random damage 10-60
      const success = Math.random() > 0.2; // 80% chance to hit

      let message = `⚔️ <@${attackerID}> attacks ${target}!\n`;

      if (success) {
        message += `💥 Hit successful! Damage dealt: ${damage}`;
      } else {
        message += `❌ Attack missed! No damage dealt.`;
      }

      api.sendMessage({ body: message, mentions: [{ tag: `<@${attackerID}>`, id: attackerID }] }, event.threadID);

      // Set cooldown
      cooldowns.set(attackerID, now);

    } catch (err) {
      console.error(err);
      api.sendMessage("❌ Error executing attack.", event.threadID);
    }
  },
};
