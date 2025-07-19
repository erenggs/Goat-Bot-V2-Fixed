const axios = require("axios");

module.exports = {
  config: {
    name: "game",
    aliases: ["gplay", "funplay"],
    version: "1.0",
    author: "eran",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "🎮 Get a random fun game to play!",
    },
    category: "fun",
    guide: {
      en: "{pn} - Sends a random game idea or mini challenge",
    },
  },

  onStart: async function ({ message, args }) {
    const gameList = [
      "🧠 Truth or Dare - Ask or Dare your friend something crazy!",
      "🎯 Try hitting a bottle cap with a coin from 2 meters away.",
      "📱 Play a 1-minute typing speed battle with someone!",
      "🎲 Roll a dice (1-6), the loser has to sing!",
      "🤔 5-second game: Name 3 animals that can fly!",
      "🎮 Mobile Game Challenge: Play Free Fire or PUBG with only melee!",
      "💬 Emoji Guess: Send an emoji and your friend must guess the word!",
      "🔤 A to Z game: Say a word starting with A, next person B, and so on!",
      "👀 I Spy: Pick an object around you and let others guess.",
      "🎤 Sing a song line backwards. Others guess the song!"
    ];

    const randomGame = gameList[Math.floor(Math.random() * gameList.length)];
    message.reply(`🎲 Random Game Suggestion:\n${randomGame}`);
  },
};
