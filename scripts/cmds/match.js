const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

module.exports = {
  config: {
    name: "match",
    version: "1.0",
    author: "eran",
    countDown: 5,
    role: 0,
    shortDescription: "💘 Match two people in chat",
    longDescription: "Randomly match two members and show their love match",
    category: "love",
    guide: "{pn}"
  },

  onStart: async function ({ api, event, usersData }) {
    const threadInfo = await api.getThreadInfo(event.threadID);
    const participants = threadInfo.participantIDs.filter(id => id !== api.getCurrentUserID());

    if (participants.length < 2)
      return api.sendMessage("❗ Need at least two participants in the group to make a match.", event.threadID);

    const shuffled = participants.sort(() => Math.random() - 0.5);
    const [id1, id2] = shuffled;

    const user1 = await usersData.get(id1);
    const user2 = await usersData.get(id2);

    const name1 = user1.name;
    const name2 = user2.name;

    const img1 = await loadImage(`https://graph.facebook.com/${id1}/picture?width=512&height=512`);
    const img2 = await loadImage(`https://graph.facebook.com/${id2}/picture?width=512&height=512`);
    const bg = await loadImage("https://i.imgur.com/EFQ6aVE.jpg"); // Background image URL

    const canvas = createCanvas(800, 500);
    const ctx = canvas.getContext("2d");

    // Draw background
    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

    // Draw profile circles
    ctx.save();
    ctx.beginPath();
    ctx.arc(200, 250, 100, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(img1, 100, 150, 200, 200);
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.arc(600, 250, 100, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(img2, 500, 150, 200, 200);
    ctx.restore();

    // Draw names and love emoji
    ctx.font = "30px Arial";
    ctx.fillStyle = "#ff3366";
    ctx.textAlign = "center";
    ctx.fillText(`${name1} 💞 ${name2}`, 400, 470);

    const outputPath = path.join(__dirname, "cache", `match-${event.senderID}.png`);
    fs.writeFileSync(outputPath, canvas.toBuffer("image/png"));

    api.sendMessage({
      body: `😍 Match Made in Heaven 😍\n💑 ${name1} 💖 ${name2}`,
      attachment: fs.createReadStream(outputPath)
    }, event.threadID, () => fs.unlinkSync(outputPath));
 FanFann
