module.exports = {
  config: {
    name: "namelist",
    version: "1.0",
    author: "eran",
    countDown: 5,
    role: 0,
    shortDescription: "Show all member names",
    longDescription: "Lists the names of all members in the current group",
    category: "info"
  },

  onStart: async function ({ message, event, threadsData, usersData }) {
    const threadID = event.threadID;

    try {
      const threadData = await threadsData.get(threadID);
      const members = threadData.members;

      if (!members || Object.keys(members).length === 0) {
        return message.reply("❌ No members found in this thread.");
      }

      // Get full name list
      const nameList = await Promise.all(
        Object.keys(members).map(async (uid, index) => {
          const user = await usersData.get(uid);
          return `${index + 1}. ${user.name || "Unknown User"}`;
        })
      );

      // Split into chunks to avoid character limit (~4000)
      const chunkSize = 50;
      for (let i = 0; i < nameList.length; i += chunkSize) {
        const chunk = nameList.slice(i, i + chunkSize).join("\n");
        await message.reply(`👥 𝗠𝗲𝗺𝗯𝗲𝗿 𝗟𝗶𝘀𝘁 (${i + 1}–${i + chunk.length}):\n\n${chunk}`);
      }

    } catch (err) {
      console.error(err);
      return message.reply("❌ Failed to fetch name list.");
    }
  }
};
