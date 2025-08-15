const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");

module.exports = {
  config: {
    name: "setgrouppic",
    aliases: ["setgp", "grouppic"],
    version: "1.0",
    author: "eran",
    countDown: 10,
    role: 2, // admin only
    shortDescription: "🖼️ Change the group profile picture",
    longDescription: "Set or update the group profile picture by replying to an image or providing an image URL.",
    category: "Group",
  },

  run: async ({ api, event, args, utils }) => {
    try {
      // Check if admin
      const senderID = event.senderID;
      const threadInfo = await api.getThreadInfo(event.threadID);
      if (!threadInfo.adminIDs.some(adm => adm.id === senderID)) {
        return api.sendMessage("❌ Only group admins can change the group picture.", event.threadID);
      }

      let imageUrl;
      if (event.messageReply?.attachments?.[0]?.url) {
        imageUrl = event.messageReply.attachments[0].url;
      } else if (args[0]) {
        imageUrl = args[0];
      } else {
        return api.sendMessage("❌ Reply to an image or provide an image URL to set as group picture.", event.threadID);
      }

      // Download the image
      const imagePath = path.join(__dirname, "temp_grouppic.jpg");
      const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
      await fs.writeFile(imagePath, response.data);

      // Set group image
      await api.setThreadImage(event.threadID, fs.createReadStream(imagePath));

      // Cleanup
      await fs.remove(imagePath);

      return api.sendMessage("✅ Group profile picture updated successfully!", event.threadID);

    } catch (err) {
      console.error(err);
      return api.sendMessage("❌ Failed to set the group picture. Make sure the image is valid.", event.threadID);
    }
  },
};
