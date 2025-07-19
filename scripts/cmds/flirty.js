const flirts = [
  "Are you a magician? Because whenever I look at you, everyone else disappears.",
  "If beauty were time, you'd be eternity.",
  "Are you French? Because Eiffel for you."
  "What are you listening to your favorite song today?"
  "It would be happy to give a favorite food or flower"
  "Everyone is different, but you are very special for me."
  "Do you know, when you laugh my battery is also charged!"
  "Bolode flirt korte aice"
  "Your smile touches the mind today."
  "Ageh prem koren”
  "Tumare deya hobe na 😊”
  "kid ghumaw 😝"
  "your so beautiful in the world"
];

module.exports = {
  config: {
    name: "flirty",
    version: "1.0",
    author: "eran",
    category: "fun",
    shortDescription: "Send a flirty line",
  },

  onStart: async function ({ message }) {
    const line = flirts[Math.floor(Math.random() * flirts.length)];
    message.reply(`💘 ${line}`);
  }
};
