const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "gamble",
    aliases: ["bet", "oll", "wager"],
    version: "1.0",
    author: "eran",
    countDown: 10,
    role: 0, // 0 = all users
    shortDescription: "🎲 Gamble your coins",
    longDescription: "Bet an amount of your coins. You can either win or lose based on luck.",
    category: "game",
  },

  onStart: async function ({ message, args, data, api }) {
    const userId = message.senderID;
    const amount = parseInt(args[0]);

    if (!amount || amount <= 0) {
      return api.sendMessage("❌ Please specify a valid amount to gamble.", message.threadID, message.messageID);
    }

    // Load user data
    const userDataFile = path.resolve(__dirname, "../database/users.json");
    let users = await fs.readJson(userDataFile).catch(() => ({}));

    if (!users[userId]) users[userId] = { coins: 1000 }; // default coins

    if (amount > users[userId].coins) {
      return api.sendMessage("❌ You don't have enough coins to gamble that amount.", message.threadID, message.messageID);
    }

    // Gamble logic (50% chance win/loss)
    const win = Math.random() < 0.5;
    let resultMessage = "";

    if (win) {
      const winnings = Math.floor(amount * 1.5);
      users[userId].coins += winnings;
      resultMessage = `🎉 You won ${winnings} coins! Your new balance: ${users[userId].coins} coins.`;
    } else {
      users[userId].coins -= amount;
      resultMessage = `😢 You lost ${amount} coins! Your new balance: ${users[userId].coins} coins.`;
    }

    // Save data
    await fs.writeJson(userDataFile, users, { spaces: 2 });

    return api.sendMessage(resultMessage, message.threadID, message.messageID);
  }
};
