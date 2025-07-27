module.exports = {
  config: {
    name: "slot2",
    version: "2.0",
    author: "eran",
    shortDescription: {
      en: "Anime slot game",
    },
    longDescription: {
      en: "Try your luck in the anime-themed slot machine!",
    },
    category: "𝗙𝗨𝗡 & 𝗚𝗔𝗠𝗘",
  },

  langs: {
    en: {
      invalid_amount: "Please enter a valid and positive amount to bet.",
      not_enough_money: "You don't have enough money to place this bet.",
      spin_message: "🎰 Spinning the anime reel...",
      win_message: "✨ You won $%1! Lucky you, otaku!",
      lose_message: "😵 You lost $%1. Better luck next time!",
      jackpot_message: "🎉 JACKPOT! You won $%1 with triple %2!",
    },
  },

  onStart: async function ({ args, message, event, usersData, getLang }) {
    const { senderID } = event;
    const userData = await usersData.get(senderID);
    const amount = parseInt(args[0]);

    if (isNaN(amount) || amount <= 0) {
      return message.reply(getLang("invalid_amount"));
    }

    if (amount > userData.money) {
      return message.reply(getLang("not_enough_money"));
    }

    const animeSlots = ["🍥", "🐉", "👺", "🧝", "🗡️", "🌀", "👊", "💮", "🍡"];
    const slot1 = animeSlots[Math.floor(Math.random() * animeSlots.length)];
    const slot2 = animeSlots[Math.floor(Math.random() * animeSlots.length)];
    const slot3 = animeSlots[Math.floor(Math.random() * animeSlots.length)];

    const winnings = calculateWinnings(slot1, slot2, slot3, amount);

    await usersData.set(senderID, {
      money: userData.money + winnings,
      data: userData.data,
    });

    const resultMsg = getSpinResultMessage(slot1, slot2, slot3, winnings, getLang);
    return message.reply(`${getLang("spin_message")}\n🎰 [ ${slot1} | ${slot2} | ${slot3} ]\n\n${resultMsg}`);
  },
};

function calculateWinnings(s1, s2, s3, bet) {
  if (s1 === s2 && s2 === s3) {
    return bet * 8; // Triple match
  } else if (s1 === s2 || s1 === s3 || s2 === s3) {
    return bet * 2; // Any double
  } else {
    return -bet; // Lose
  }
}

function getSpinResultMessage(s1, s2, s3, winnings, getLang) {
  if (winnings > 0) {
    if (s1 === s2 && s2 === s3) {
      return getLang("jackpot_message", winnings, s1);
    } else {
      return getLang("win_message", winnings);
    }
  } else {
    return getLang("lose_message", -winnings);
  }
}
