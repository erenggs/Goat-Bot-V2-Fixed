const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "fight",
    aliases: ["punch"],
    version: "1.0",
    author: "eran",
    countDown: 5,
    role: 0,
    shortDescription: "Fight someone",
    longDescription: "Send a funny fight GIF or message",
    category: "fun",
    guide: "{pn} @mention",
  },

  onStart: async function ({ api, event, args, usersData }) {
    const { threadID, messageID, senderID, mentions } = event;

    const mentionIDs = Object.keys(mentions);
    if (mentionIDs.length === 0)
      return api.sendMessage("👊 Tag someone to fight with!", threadID, messageID);

    const user1 = await usersData.getName(senderID);
    const user2 = mentions[mentionIDs[0]];

    const fightMessages = [
      `${user1} punched ${user2} hard! 💥`,
      `${user1} threw a kick at ${user2} 🦵`,
      `${user1} and ${user2} are fighting! 🥊🥊`,
      `${user1} did a WWE slam on ${user2} 😱`
    ];

    const result = fightMessages[Math.floor(Math.random() * fightMessages.length)];

    // Optional: Add fight GIF
    const gifUrl = "https://media.giphy.com/media/xT0GqssRweIhlz209i/giphy.gif";
    const gifPath = path.join(__dirname, "tmp_fight.gif");

    try {
      const response = await axios.get(gifUrl, { responseType: "arraybuffer" });
      fs.writeFileSync(gifPath, Buffer.from(response.data, "utf-8"));

      api.sendMessage({
        body: result,
        attachment: fs.createReadStream(gifPath)
      }, threadID, () => fs.unlinkSync(gifPath), messageID);
    } catch (err) {
      console.error(err);
      return api.sendMessage(result, threadID, messageID);
    }
  }
};
