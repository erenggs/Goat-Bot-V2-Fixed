const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "groupinfo",
    aliases: ["ginfo", "gi"],
    version: "1.0",
    author: "eran",
    countDown: 10,
    role: 2, // admin only
    shortDescription: "ℹ️ Show detailed information about the group",
    longDescription: "Displays the group name, ID, member count, admin list, creation date, and more.",
    category: "admin",
  },

  async onStart({ api, event }) {
    try {
      const { threadID } = event;

      // Get thread info
      const threadInfo = await api.getThreadInfo(threadID);

      const groupName = threadInfo.threadName || "Unknown";
      const groupID = threadID;
      const memberCount = threadInfo.participantIDs.length;
      const admins = threadInfo.adminIDs.map(admin => admin.id).join(", ") || "None";
      const emoji = threadInfo.emoji || "None";
      const approvalMode = threadInfo.approvalMode ? "Enabled" : "Disabled";
      const createdTime = moment(threadInfo.threadCreationTime).format("DD/MM/YYYY HH:mm");

      // Build message
      const message = 
`📌 Group Information:
- Name: ${groupName}
- ID: ${groupID}
- Members: ${memberCount}
- Admins: ${admins}
- Emoji: ${emoji}
- Approval Mode: ${approvalMode}
- Created: ${createdTime}`;

      api.sendMessage(message, threadID);
    } catch (error) {
      console.error(error);
      api.sendMessage("❌ Failed to fetch group information.", event.threadID);
    }
  }
};
