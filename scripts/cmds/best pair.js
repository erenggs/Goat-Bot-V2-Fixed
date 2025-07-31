const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { createCanvas, loadImage, registerFont } = require("canvas");

// Optional: Register font (replace with your own .ttf if needed)
registerFont(path.join(__dirname, "assets", "font.ttf"), { family: "CustomFont" });

module.exports = {
  config: {
    name: "bestpair",
    version: "1.0",
    author: "eran",
    countDown: 5,
    role: 0,
    shortDescription: "💖 Best couple pairing",
    longDescription: "Find the best pair in the group chat",
    category: "love",
    guide: "{pn}"
  },

  onStart: async function ({ api, event, usersData }) {
    const threadInfo = await api.getThreadInfo(event.threadID);
    const participantIDs = threadInfo.participantIDs.filter(id => id !== api.getCurrentUserID());

    if (participantIDs.length < 2) {
      return api.sendMessage("❗ Need at least 2 people to make a pair!", event.threadID);
    }

    // Get two random users
    const [id1, id2] = participantIDs.sort(() => 0.5 - Math.random()).slice(0, 2);
    const user1 = await usersData.get(id1);
    const user2 = await usersData.get(id2);

    const name1 = user1.name;
    const name2 = user2.name;

    // Optional: Load profile images (if needed)
    const avatar1 = `https://graph.facebook.com/${id1}/picture?width=512&height=512`;
    const avatar2 = `https://graph.facebook.com/${id2}/picture?width=512&height=512`;

    // Load images and create canvas
    const [img1, img2, bg] = await Promise.all([
      loadImage(avatar1),
      loadImage(avatar2),
      loadImage("https://i.imgur.com/vV3zR0y.jpg") // Replace with a background image URL
    ]);

    const canvas = createCanvas(800, 500);
    const ctx = canvas.getContext("2d");

    // Draw background
    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

    // Draw profile pics
    ctx.beginPath();
    ctx.arc(200, 250, 100, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(img1, 100, 150, 200, 200);

    ctx.restore();
    ctx.beginPath();
    ctx.arc(600, 250, 100, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(img2, 500, 150, 200, 200);

    ctx.restore();

    // Write text
    ctx.font = "30px CustomFont";
    ctx.fillStyle = "#ff0066";
    ctx.fillText(`${name1} ❤️ ${name2}`, 260, 480);

    const outputPath = path.join(__dirname, "cache", `bestpair-${event.senderID}.png`);
    const buffer = canvas.toBuffer("image/png");
    fs.writeFileSync(outputPath, buffer);

    api.sendMessage({
      body: `💞 Best Pair of the Day 💞\n💑 ${name1} ❤️ ${name2}`,
      attachment: fs.createReadStream(outputPath)
    }, event.threadID, () => fs.unlinkSync(outputPath));
 Fannnn
