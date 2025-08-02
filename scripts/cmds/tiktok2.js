// File: tiktok.js
// Description: Sends a random TikTok video
// Author: Eran + Modified by FanFan

const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "tiktok2",
    aliases: ["tiktokvid", "ttvideo"],
    version: "1.0",
    author: "Eran",
    countDown: 5,
    role: 0,
    shortDescription: "Send a random TikTok video",
    longDescription: "Fetches and sends a random TikTok video using an online API",
    category: "media"
  },

  onStart: async function ({ message, event, api }) {
    try {
      // Replace with your real TikTok random video API
      const tiktokApi = await axios.get("https://www.x-noobs-apis.42web.io/mostakim/tiktok-random");

      const videoUrl = tiktokApi.data.url;
      const title = tiktokApi.data.title || "🎵 TikTok Random Video";
      if (!videoUrl) return message.reply("❌ No video URL found from the API!");

      const tempFilePath = path.join(__dirname, "tiktok_video.mp4");
      const writer = fs.createWriteStream(tempFilePath);

      const videoStream = await axios({
        url: videoUrl,
        method: "GET",
        responseType: "stream"
      });

      videoStream.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

      await message.reply({
        body: title,
        attachment: fs.createReadStream(tempFilePath)
      });

      fs.unlink(tempFilePath, (err) => {
        if (err) console.error("Failed to delete temp file:", err.message);
      });

    } catch (error) {
      message.reply(`❌ Error fetching TikTok video:\n${error.message}`);
    }
  }
};
