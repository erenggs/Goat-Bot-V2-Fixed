// bully.js
module.exports = {
  config: {
    name: "bully",
    version: "1.0.0",
    author: "eren",
    description: "Playfully bully a mentioned user 😈",
    category: "fun",
    usage: "bully @mention",
    cooldowns: 5
  },

  onStart: async function ({ api, event }) {
    const { threadID, mentions, senderID } = event;
    const mentionIDs = Object.keys(mentions);

    if (mentionIDs.length === 0) {
      return api.sendMessage(
        "😈 Please mention someone to bully!\nExample: bully @user",
        threadID
      );
    }

    const targetID = mentionIDs[0];
    const targetName = mentions[targetID].replace("@", "");

    const bullyLines = [
      "🤡 {name}, even Google can’t find your intelligence.",
      "😂 {name}, you’re not stupid, you just have bad luck thinking.",
      "😏 {name}, your brain has left the chat.",
      "🐸 {name}, even WiFi has better connection than your logic.",
      "🙃 {name}, NPC behavior detected.",
      "🤣 {name}, you make bugs look well-coded."
    ];

    const msg =
      bullyLines[Math.floor(Math.random() * bullyLines.length)]
        .replace("{name}", targetName);

    return api.sendMessage(
      {
        body: msg,
        mentions: [{ id: targetID, tag: targetName }]
      },
      threadID
    );
  }
};