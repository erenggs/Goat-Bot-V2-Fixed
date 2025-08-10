// animekiss.js
const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: "animekiss",
    aliases: ["anikiss", "aikisse"],
    version: "1.0",
    author: "eran_hossain",
    shortDescription: "Send an anime kiss gif",
    longDescription: "Fetches a random anime kiss GIF and sends it. Mentions a replied-to user or a tagged user. Falls back to nekos.life and local GIFs if needed.",
    category: "fun",
    guide: "{pn}animekiss [@user]"
  },

  onStart: async function ({ message, event, api, args }) {
    // helper to download image buffer to disk and return filepath
    async function downloadToTemp(url, filename) {
      const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 });
      const tmpDir = path.join(__dirname, 'tmp');
      if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);
      const filePath = path.join(tmpDir, filename);
      fs.writeFileSync(filePath, Buffer.from(res.data, 'binary'));
      return filePath;
    }

    // try primary API: waifu.pics
    async function fetchKissUrl() {
      try {
        const r = await axios.get('https://api.waifu.pics/sfw/kiss', { timeout: 8000 });
        if (r.data && r.data.url) return r.data.url;
      } catch (e) { /* ignore, fall through */ }

      // fallback: nekos.life
      try {
        const r2 = await axios.get('https://nekos.life/api/v2/img/kiss', { timeout: 8000 });
        if (r2.data && r2.data.url) return r2.data.url;
      } catch (e) { /* ignore, fall through */ }

      // last resort: use a local list of GIF urls (or local files). Add your local GIF paths/URLs below.
      const localFallbacks = [
        // example remote URLs (replace with your own hosted assets if you have them)
        'https://i.imgur.com/abcd123.gif', 
        'https://i.imgur.com/efgh456.gif'
      ];
      return localFallbacks[Math.floor(Math.random() * localFallbacks.length)];
    }

    try {
      // determine target: replied-to user or mention or sender
      let targetName = null;
      if (event && event.type && event.type === 'message_reply' && event.messageReply && event.messageReply.senderID) {
        // if replied to someone
        targetName = event.messageReply.senderName || `there`;
      } else if (event && event.mentions && Object.keys(event.mentions).length) {
        // if someone was mentioned, take first mention
        const mentionIds = Object.keys(event.mentions);
        const first = mentionIds[0];
        targetName = event.mentions[first].replace(/@/g, '') || `there`;
      } else {
        // default: sender (you kiss the air 😇)
        targetName = message.senderName || "you";
      }

      const url = await fetchKissUrl();
      if (!url) throw new Error('No image URL available');

      // extract extension, create temp filename
      const extMatch = url.match(/\.(gif|png|jpe?g|webp)(\?|$)/i);
      const ext = extMatch ? extMatch[1] : 'gif';
      const filename = `animekiss_${Date.now()}.${ext}`;

      // download and send
      const filepath = await downloadToTemp(url, filename);

      const mentionText = targetName === (message.senderName || "you")
        ? `${message.senderName} sends a sweet kiss 💋`
        : `${message.senderName} kisses ${targetName} 💋`;

      // api.sendMessage format used by many FB chatbots; adapt keys if your bot differs
      await api.sendMessage({
        body: mentionText,
        mentions: [{
          tag: message.senderName,
          id: event.senderID
        }],
        attachment: fs.createReadStream(filepath)
      }, event.threadID, event.messageID);

      // cleanup temp file after send
      try { fs.unlinkSync(filepath); } catch (e) { /* ignore */ }

    } catch (err) {
      console.error("animekiss error:", err);
      // graceful failure message
      await api.sendMessage(`Sorry, couldn't fetch a kiss GIF right now. Try again later!`, event.threadID, event.messageID);
    }
  }
};
