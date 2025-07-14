const axios = require("axios");
const fs = require("fs");
const path = require("path");
const os = require("os");
const ytSearch = require("yt-search");

module.exports = {
  name: "sing",
  version: "0.0.1",
  aliases: ["music", "song"],
  description: "Searches and sends music/songs from YouTube.",
  author: "eran",
  prefix: true,
  category: "music",
  cooldown: 5,

  async xyz({ bot, chat, msg, args }) {
    let songName;
    let downloadType = "audio";

    if (args.length === 0) {
      return chat.reply("Please provide a song name to search for. \nUsage: `{p}sing <song name> [audio/video]`");
    }

    const lastArg = args[args.length - 1].toLowerCase();
    if (lastArg === "audio" || lastArg === "video") {
      downloadType = lastArg;
      songName = args.slice(0, -1).join(" ");
    } else {
      songName = args.join(" ");
    }

    if (!songName) {
      return chat.reply("Please provide a song name to search for.");
    }

    const processingMessage = await chat.reply("🎵 Searching and preparing your song...");

    try {
      const searchResults = await ytSearch(songName);
      if (!searchResults || !searchResults.videos.length) {
        await bot.editMessageText("❌ No results found for your search query.", {
          chat_id: msg.chat.id,
          message_id: processingMessage.message_id
        });
        return;
      }

      const topResult = searchResults.videos[0];
      const videoId = topResult.videoId;
      const songTitle = topResult.title;

      const apiKey = global.config.youtubeApiKey || "itzaryan";
      const apiUrl = `https://noobs-xyz-aryan.vercel.app/youtube?id=${videoId}&type=${downloadType}&apikey=${apiKey}`;

      await bot.editMessageText(`⏳ Found "${songTitle}". Downloading...`, {
        chat_id: msg.chat.id,
        message_id: processingMessage.message_id
      });

      const downloadResponse = await axios.get(apiUrl);
      const downloadUrl = downloadResponse.data.downloadUrl;

      if (!downloadUrl) {
        throw new Error("Failed to get download URL from the API.");
      }

      const response = await axios({
        method: 'get',
        url: downloadUrl,
        responseType: 'stream'
      });

      const fileExtension = downloadType === "audio" ? "mp3" : "mp4";
      const filename = `${songTitle.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.${fileExtension}`;
      const downloadPath = path.join(os.tmpdir(), filename);

      const writer = fs.createWriteStream(downloadPath);
      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      await bot.editMessageText(`✅ Downloaded "${songTitle}". Sending...`, {
        chat_id: msg.chat.id,
        message_id: processingMessage.message_id
      });

      if (downloadType === "audio") {
        await chat.sendAudio(downloadPath, {
          caption: `**${songTitle}**`,
          parse_mode: 'Markdown',
        });
      } else {
        await chat.sendVideo(downloadPath, {
          caption: `**${songTitle}**`,
          parse_mode: 'Markdown',
        });
      }

      fs.unlinkSync(downloadPath);
      await chat.xyz(processingMessage);

    } catch (error) {
      console.error(`Error in sing command: ${error.message}`);
      if (processingMessage && processingMessage.message_id) {
        await chat.xyz(processingMessage).catch(e => console.error("Failed to delete processing message on error:", e));
      }
      await chat.reply(`⚠️ Failed to download or send song: ${error.message}`);
    }
  }
};
