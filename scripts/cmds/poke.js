const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: "poke",
    aliases: [],
    version: "1.1",
    author: "eran_hossain",
    shortDescription: "👉👈 Playfully poke a friend",
    longDescription: "Mentions a friend and sends a random anime poke GIF with a fun message.",
    category: "fun",
    guide: "{pn}poke [@mention | reply]"
  },

  onStart: async function ({ message, event, api }) {
    // Fun poke message templates
    const pokeMessages = [
      "👉👈 {sender} pokes {target} softly~ 💖",
      "😏 {sender} sneakily pokes {target} 👆",
      "😂 {sender} can't resist poking {target} 🙃",
      "🥰 {sender} gives a gentle poke to {target} ✨",
      "🤭 {sender} pokes {target} and runs away! 🏃💨"
    ];

    async function fetchPokeGif() {
      try {
        const res = await axios.get('https://api.waifu.pics/sfw/poke', { timeout: 8000 });
        return res.data.url;
      } catch {
        try {
          const res2 = await axios.get('https://nekos.life/api/v2/img/poke', { timeout: 8000 });
          return res2.data.url;
        } catch {
          return null;
        }
      }
    }

    async function downloadImage(url, filename) {
      const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 });
      const tmpDir = path.join(__dirname, 'tmp');
      fs.mkdirSync(tmpDir, { recursive: true });
      const filePath = path.join(tmpDir, filename);
      fs.writeFileSync(filePath, Buffer.from(res.data, 'binary'));
      return filePath;
    }

    try {
      let targetID, targetName;

      // Determine target
      if (event.type === "message_reply") {
        targetID = event.messageReply.senderID;
        targetName = event.messageReply.senderName;
      } else if (Object.keys(event.mentions).length > 0) {
        targetID = Object.keys(event.mentions)[0];
        targetName = event.mentions[targetID];
      } else {
        return message.reply("⚠️ Please @mention or reply to someone to poke! 👉👈");
      }

      // Fetch GIF
      const gifUrl = await fetchPokeGif();
      if (!gifUrl) return message.reply("❌ Couldn't fetch poke GIF right now. Try again later.");

      // Download
      const ext = gifUrl.match(/\.(gif|png|jpg|jpeg|webp)(\?|$)/i)?.[1] || "gif";
      const filePath = await downloadImage(gifUrl, `poke_${Date.now()}.${ext}`);

      // Pick random poke text
      const pokeText = pokeMessages[Math.floor(Math.random() * pokeMessages.length)]
        .replace("{sender}", message.senderName)
        .replace("{target}", targetName);

      // Send message
      await api.sendMessage({
        body: pokeText,
        mentions: [
          { tag: message.senderName, id: event.senderID },
          { tag: targetName, id: targetID }
        ],
        attachment: fs.createReadStream(filePath)
      }, event.threadID, () => fs.unlinkSync(filePath));

    } catch (err) {
      console.error(err);
      message.reply("⚠️ Oops! Something went wrong while poking. 😅");
    }
  }
};
