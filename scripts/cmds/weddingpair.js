const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

module.exports = {
  config: {
    name: "weddingpair",
    version: "1.0",
    author: "eran",
    countDown: 5,
    role: 0,
    shortDescription: "💍 Wedding couple pairing",
    longDescription: "Randomly selects two users and pairs them as a wedding couple",
    category: "love",
    guide: "{pn}"
  },

  onStart: async function ({ api, event, usersData }) {
    const threadInfo = await api.getThreadInfo(event.threadID);
    const members = threadInfo.participantIDs.filter(id => id !== api.getCurrentUserID());

    if (members.length < 2) {
      return api.sendMessage("👰🤵 Need at least two users in the group to pair for a wedding!", event.threadID);
    }

    const [id1, id2] = members.sort(() => Math.random() - 0.5).slice(0, 2);

    const user1 = await usersData.get(id1);
    const user2 = await usersData.get(id2);
    const name1 = user1.name;
    const name2 = user2.name;

    const avatar1 = `https://graph.facebook.com/${event.senderID}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662 `;
    const avatar2 = `https://graph.facebook.com/${selectedMatch.id}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
    const bgURL = "https://i.imgur.com/Uj3bJtF.jpeg"; // Wedding-themed background

    const [img1, img2, bg] = await Promise.all([
      loadImage(avatar1),
      loadImage(avatar2),
      loadImage(bgURL)
    ]);

    const canvas = createCanvas(800, 500);
    const ctx = canvas.getContext("2d");

    // Background
    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

    // Profile circles
    ctx.save();
    ctx.beginPath();
    ctx.arc(200, 260, 90, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(img1, 110, 170, 180, 180);
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.arc(600, 260, 90, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(img2, 510, 170, 180, 180);
    ctx.restore();

    // Wedding Text
    ctx.font = "30px Georgia";
    ctx.fillStyle = "#ff6699";
    ctx.textAlign = "center";
    ctx.fillText(`${name1} 💍 ${name2}`, 400, 460);
    ctx.font = "28px Brush Script MT";
    ctx.fillText("💒 Wedding Couple of the Day 💒", 400, 50);

    const filePath = path.join(__dirname, "cache", `weddingpair-${event.senderID}.png`);
    fs.writeFileSync(filePath, canvas.toBuffer("image/png"));

    api.sendMessage({
      body: `💍 Today’s most beautiful wedding pair:\n👰 ${name1} & 🤵 ${name2}\n💐 Wishing them a lifetime of love and laughter!`,
      attachment: fs.createReadStream(filePath)
    }, event.threadID, () => fs.unlinkSync(filePath));
  }
};
