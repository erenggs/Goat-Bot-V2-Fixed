module.exports = {
  config: {
    name: "ludo",
    version: "1.0",
    author: "eran",
    shortDescription: { en: "Play a Ludo-style dice game" },
    longDescription: { en: "Challenge a friend to roll dice and race to the finish!" },
    category: "𝗙𝗨𝗡 & 𝗚𝗔𝗠𝗘",
    cooldown: 5,
  },

  langs: {
    en: {
      start_game: "🎲 Ludo Dice Game Started!\n%1 vs %2\nType `roll` to roll the dice!",
      not_enough_players: "Please mention one person to play Ludo with.",
      not_your_turn: "⛔ It's not your turn!",
      rolled: "%1 rolled a 🎲 %2 (Total: %3)",
      win: "🏁 %1 wins the game by reaching 30!",
      game_already_running: "A game is already running in this chat. Finish it first.",
      no_game_running: "❌ No active Ludo game in this chat.",
      game_cancelled: "🚫 Ludo game cancelled.",
      only_players: "Only %1 or %2 can roll in this game.",
    },
  },

  games: {}, // In-memory tracking per thread

  onStart: async function ({ args, message, event, getLang }) {
    const { mentions, threadID, senderID } = event;

    if (this.games[threadID]) {
      return message.reply(getLang("game_already_running"));
    }

    const opponentID = Object.keys(mentions)[0];
    if (!opponentID || opponentID === senderID) {
      return message.reply(getLang("not_enough_players"));
    }

    this.games[threadID] = {
      players: [senderID, opponentID],
      scores: {
        [senderID]: 0,
        [opponentID]: 0,
      },
      turn: senderID,
    };

    const name1 = (await global.usersData.get(senderID))?.name || "Player 1";
    const name2 = (await global.usersData.get(opponentID))?.name || "Player 2";

    return message.reply(getLang("start_game", name1, name2));
  },

  onMessage: async function ({ message, event, getLang }) {
    const { body, senderID, threadID } = event;
    const game = this.games[threadID];

    if (!game) return;

    const cmd = body.trim().toLowerCase();

    if (cmd === "roll") {
      if (!game.players.includes(senderID)) {
        return message.reply(getLang("only_players", "Player 1", "Player 2"));
      }

      if (senderID !== game.turn) {
        return message.reply(getLang("not_your_turn"));
      }

      const roll = Math.floor(Math.random() * 6) + 1;
      game.scores[senderID] += roll;

      const name = (await global.usersData.get(senderID))?.name || "Player";

      message.reply(getLang("rolled", name, roll, game.scores[senderID]));

      if (game.scores[senderID] >= 30) {
        delete this.games[threadID];
        return message.reply(getLang("win", name));
      }

      // Switch turn
      game.turn = game.players.find((id) => id !== senderID);
    }

    if (cmd === "cancel") {
      if (game.players.includes(senderID)) {
        delete this.games[threadID];
        return message.reply(getLang("game_cancelled"));
      }
    }
  },
};
