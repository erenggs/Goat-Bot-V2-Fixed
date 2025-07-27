const questions = [
  {
    question: "🍥 Who is known as the 'Copy Ninja' in Naruto?",
    answer: "kakashi",
  },
  {
    question: "🐉 What are the magical items used to summon Shenron in Dragon Ball?",
    answer: "dragon balls",
  },
  {
    question: "🗡️ What is the name of the main character in Sword Art Online?",
    answer: "kirito",
  },
  {
    question: "👹 In Demon Slayer, what is Tanjiro’s sister's name?",
    answer: "nezuko",
  },
  {
    question: "👊 Who defeats enemies with a single punch?",
    answer: "saitama",
  },
  {
    question: "🔥 Who is the Flame Hashira in Demon Slayer?",
    answer: "rengoku",
  },
  {
    question: "🎤 Who sings the opening song 'Gurenge' for Demon Slayer?",
    answer: "liSA",
  },
  {
    question: "💀 What is the name of the notebook in Death Note?",
    answer: "death note",
  },
];

module.exports = {
  config: {
    name: "quiz",
    version: "1.0",
    author: "eran",
    shortDescription: { en: "Anime quiz game" },
    longDescription: { en: "Answer anime trivia and test your weeb knowledge!" },
    category: "𝗙𝗨𝗡 & 𝗚𝗔𝗠𝗘",
    cooldown: 10,
  },

  langs: {
    en: {
      time_up: "⏰ Time's up! The correct answer was: %1",
      correct: "✅ Correct! You're a true otaku!",
      incorrect: "❌ Wrong answer. Try again next time!",
      question_prompt: "🧠 Anime Quiz:\n%1\n\nYou have 15 seconds to answer!",
    },
  },

  onStart: async function ({ message, event, commandName, getLang, api }) {
    const { threadID, messageID, senderID } = event;
    const random = questions[Math.floor(Math.random() * questions.length)];
    const correctAnswer = random.answer.toLowerCase();

    message.reply(getLang("question_prompt", random.question), async (err, info) => {
      if (err) return;

      const listener = async (reply) => {
        if (reply.senderID !== senderID) return;

        const userAnswer = reply.body.trim().toLowerCase();

        if (userAnswer === correctAnswer) {
          api.unsendMessage(info.messageID);
          message.reply(getLang("correct"));
          return api.removeMessageListener(listener);
        } else {
          message.reply(getLang("incorrect"));
          return api.removeMessageListener(listener);
        }
      };

      api.addMessageListener(listener);

      // Timeout: remove listener if time expires
      setTimeout(() => {
        api.removeMessageListener(listener);
        message.reply(getLang("time_up", correctAnswer));
      }, 15000); // 15 seconds
    });
  },
};
