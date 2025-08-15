const { randomInt } = require("crypto"); // or Math.random if you prefer

module.exports = {
  config: {
    name: "roll",
    aliases: ["dice", "rng"],
    version: "1.0",
    author: "eran",
    countDown: 10,
    role: 0, // everyone can use
    shortDescription: "🎲 Roll a dice or pick a random number",
    longDescription: "Rolls a dice or selects a random number between 1 and your chosen maximum",
    category: "Fun",
  },

  run: async ({ api, event, args }) => {
    try {
      let max = 6; // default dice
      if (args[0]) {
        const parsed = parseInt(args[0]);
        if (!isNaN(parsed) && parsed > 1) max = parsed;
      }

      const result = randomInt(1, max + 1); // random number between 1 and max
      return api.sendMessage(`🎲 You rolled: ${result} (1-${max})`, event.threadID);
    } catch (err) {
      return api.sendMessage("❌ Something went wrong while rolling!", event.threadID);
    }
  },
};
