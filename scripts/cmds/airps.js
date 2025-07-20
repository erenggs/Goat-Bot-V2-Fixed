// aiRPS.js
module.exports = {
  config: {
    name: "airps",
    aliases: ["rps", "rockpaperscissors"],
    version: "1.0",
    author: "eran",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Play Rock Paper Scissors with AI"
    },
    longDescription: {
      en: "A fun Rock Paper Scissors game where you can play against the bot!"
    },
    category: "fun",
    guide: {
      en: "{pn} [rock|paper|scissors]"
    }
  },

  onStart: async function ({ message, args }) {
    const userChoice = args[0]?.toLowerCase();
    const choices = ["rock", "paper", "scissors"];
    const botChoice = choices[Math.floor(Math.random() * choices.length)];

    if (!choices.includes(userChoice)) {
      return message.reply("❌ Please choose `rock`, `paper`, or `scissors`.\nExample: airps rock");
    }

    // Determine the winner
    let result = "";
    if (userChoice === botChoice) {
      result = "🤝 It's a tie!";
    } else if (
      (userChoice === "rock" && botChoice === "scissors") ||
      (userChoice === "paper" && botChoice === "rock") ||
      (userChoice === "scissors" && botChoice === "paper")
    ) {
      result = "🎉 You win!";
    } else {
      result = "😢 You lose!";
    }

    message.reply(
      `🧠 AI chose: **${botChoice}**\n🧍 You chose: **${userChoice}**\n\n${result}`
    );
  }
};
