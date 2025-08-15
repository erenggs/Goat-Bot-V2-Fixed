const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "pinterest",
    aliases: ["pin", "pint"],
    version: "1.2",
    author: "eran",
    countDown: 10,
    role: 0,
    description: "Search Pinterest and get all image results",
    category: "image",
    guide: {
      en: "{pn} [keyword] — Get Pinterest image results\nExample: {pn} Naruto"
    }
  },

  onStart: async function ({ api, event, args }) {
    const query = args.join(" ");
    if (!query) {
      return api.sendMessage(
        "❗ Please provide a search keyword.\nExample: pinterest Naruto",
        event.threadID,
        event.messageID
      );
    }

    try {
      const url = `https://betadash-api-swordslush-production.up.railway.app/pinterest?search=${encodeURIComponent(query)}`;
      const res = await axios.get(url);

      const imageList = res.data?.data;
      if (!Array.isArray(imageList) || imageList.length === 0) {
        return api.sendMessage("❌ No results found!", event.threadID, event.messageID);
      }

      const attachments = [];

      // Download all images
      for (let i = 0; i < imageList.length; i++) {
        try {
          const imageRes = await axios.get(imageList[i], { responseType: "arraybuffer" });
          const imagePath = path.join(__dirname, `pin_${Date.now()}_${i}.jpg`);
          await fs.writeFile(imagePath, imageRes.data);
          attachments.push(fs.createReadStream(imagePath));
        } catch (err) {
          console.error(`Failed to download image ${i}:`, err.message);
        }
      }

      if (attachments.length === 0) {
        return api.sendMessage("❌ Failed to download all images.", event.threadID, event.messageID);
      }

      api.sendMessage(
        {
          body: `🔍 Pinterest results for: "${query}" (${attachments.length} images)`,
          attachment: attachments
        },
        event.threadID,
        async () => {
          // Clean up downloaded files
          for (let i = 0; i < attachments.length; i++) {
            const filePattern = path.join(__dirname, `pin_*_${i}.jpg`);
            const files = await fs.readdir(__dirname);
            for (const file of files) {
              if (file.match(new RegExp(`pin_.*_${i}\\.jpg`))) {
                await fs.unlink(path.join(__dirname, file));
              }
            }
          }
        },
        event.messageID
      );

    } catch (err) {
      console.error(err);
      api.sendMessage("🚫 Error fetching from Pinterest API.", event.threadID, event.messageID);
    }
  }
};
