const axios = require('axios');

module.exports = {
  config: {
    name: "activemember",
    aliases: ["amb"],
    version: "1.4",
    author: "eran",
    countDown: 10,
    role: 2,
    shortDescription: "🔥 Top 50 chat members by messages",
    longDescription: "🔥 Shows the top 50 most active members in the chat based on message count",
    category: "fun",
    guide: "{p}{n}",
  },

  onStart: async function ({ api, event }) {
    const threadId = event.threadID;
    const senderId = event.senderID;

    try {
      // Get thread participants
      const threadInfo = await api.getThreadInfo(threadId, { participantIDs: true });
      const participantIDs = threadInfo.participantIDs;

      // Initialize message counts
      const messageCounts = {};
      participantIDs.forEach(id => messageCounts[id] = 0);

      // Dynamically fetch all messages in the thread
      let allMessages = [];
      let lastMessageID = null;
      while (true) {
        const messages = await api.getThreadHistory(threadId, 100, lastMessageID ? lastMessageID : undefined);
        if (!messages || messages.length === 0) break;
        allMessages = allMessages.concat(messages);
        lastMessageID = messages[messages.length - 1].messageID;
        if (messages.length < 100) break; // stop if less than limit
      }

      // Count messages per user
      allMessages.forEach(msg => {
        if (messageCounts[msg.senderID] !== undefined) {
          messageCounts[msg.senderID]++;
        }
      });

      // Get top 50 active users
      const topUsers = Object.entries(messageCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 50);

      // Batch fetch user info
      const userInfo = await api.getUserInfo(topUsers.map(u => u[0]));

      // Emoji ranking for top users
      const rankingEmojis = ["🥇","🥈","🥉","🏅","🎖️","✨","💎","🔥","🌟","🎯",
                             "🎉","🥳","💪","🏆","🌈","🍀","🎁","💖","💫","🪐",
                             "🌹","🍁","🌞","🌙","⭐","⚡","🌊","🍓","🍒","🍍",
                             "🥭","🍌","🍉","🥝","🍇","🍋","🍊","🥥","🥑","🥦",
                             "🌽","🥕","🫑","🍆","🥔","🧄","🧅","🥬","🥒","🫛"];

      // Format top users list
      const userList = topUsers.map(([userId, count], index) => {
        const name = userInfo[userId] ? userInfo[userId].name : "Unknown";
        const emoji = rankingEmojis[index] || "💌";
        return `${emoji} 『${name}』\n💬 Messages: ${count}\n`;
      });

      // Send message with mentions
      const messageText = `💁‍♀️✨ *Top 50 Active Members in this chat* ✨💁‍♂️:\n${userList.join('\n')}`;
      api.sendMessage({ body: messageText, mentions: [{ tag: senderId, id: senderId, type: "user" }] }, threadId);

    } catch (error) {
      console.error("❌ Error fetching active members:", error);
    }
  },
};
