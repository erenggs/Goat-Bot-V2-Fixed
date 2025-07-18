const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: 'video',
    author: 'Mostakim',
    category: 'Youtube Video Downloader'
  },
  onStart: async ({ event, api, args, message }) => {
    try {
      const query = args.join(' ');
      if (!query) return message.reply('Please provide a search query!');

      const searchResponse = await axios.get(`https://www.x-noobs-apis.42web.io/mostakim/ytSearch?search=${encodeURIComponent(query)}`);
      api.setMessageReaction("⏳", event.messageID, () => {}, true);

      const video = searchResponse.data[0];
      if (!video || !video.url) return message.reply('No video found!');

      const videoApi = await axios.get(`https://www.x-noobs-apis.42web.io/m/ytdl?url=${video.url}`);
      if (!videoApi.data.url) throw new Error('No video URL found in API response.');

      const tempFilePath = path.join(__dirname, 'temp_video.mp4');
      const writer = fs.createWriteStream(tempFilePath);

      const videoStream = await axios({
        url: videoApi.data.url,
        method: 'GET',
        responseType: 'stream'
      });

      videoStream.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      api.setMessageReaction("✅", event.messageID, () => {}, true);

      await message.reply({
        body: `📽️ Now playing: ${video.title}\nDuration: ${video.timestamp}`,
        attachment: fs.createReadStream(tempFilePath)
      });

      fs.unlink(tempFilePath, (err) => {
        if (err) message.reply(`Error deleting temp file: ${err.message}`);
      });

    } catch (error) {
      message.reply(`Error: ${error.message}`);
    }
  }
};
