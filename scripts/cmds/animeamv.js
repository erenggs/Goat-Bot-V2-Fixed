// File: animeamv.js
// Description: Sends a random Anime AMV video
// Author: Eran + Modified by FanFan

const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "animeamv",
    aliases: ["amv", "amvvideo"],
    version: "1.0",
    author: "Eran",
    countDown: 5,
    role: 0,
    shortDescription: "Send a random Anime AMV video",
    longDescription: "Sends a random Anime AMV short video using an online API",
    category: "media"
  },

  onStart: async function ({ message, event, api }) {
    try {
      // Replace this with your actual random AMV video API
      const amvApi = await axios.get("https://www.x-noobs-apis.42web.io/mostakim/amv-random");

      const videoUrl = amvApi.data.url;
      const title = amvApi.data.title || "🎬 Anime AMV";
      if (!videoUrl) return message.reply("No video URL found from the API!");

      const tempFilePath = path.join(__dirname, "anime_amv.mp4");
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
        if (err) console.error("Failed to delete temp file:", err);
      });

    } catch (error) {
      message.reply(`❌ Error: ${error.message}`);
    }
  }
};
