const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

module.exports = {
  config: {
    name: "cutepair",
    version: "1.0",
    author: "eran",
    countDown: 5,
    role: 0,
    shortDescription: "🥰 Generate a cute pair",
    longDescription: "Randomly selects two users and shows them as a cute pair with styled image",
    category: "love",
    guide: "{pn}"
  },

  onStart: async function ({ api, event, usersData }) {
    const threadInfo = await api.getThreadInfo(event.threadID);
    const members = threadInfo.participantIDs.filter(id => id !== api.getCurrentUserID());

    if (members.length < 2) {
      return api.sendMessage("❗ Not enough members to create a cute pair!", event.threadID);
    }

    const [id1, id2] = members.sort(() => 0.5 - Math.random()).slice(0, 2);

    const user1 = await usersData.get(id1);
    const user2 = await usersData.get(id2);
    const name1 = user1.name;
    const name2 = user2.name;

    const avatar1 = `https://graph.facebook.com/${id1}/picture?width=512&height=512`;
    const avatar2 = `https://graph.facebook.com/${id2}/picture?width=512&height=512`;
    const bgURL = "https://i.imgur.com/bDjP9lO.jpg"; // Cute or pastel style background

    const [img1, img2, bg] = await Promise.all([
      loadImage(avatar1),
      loadImage(avatar2),
      loadImage(bgURL)
    ]);

    const canvas = createCanvas(800, 500);
    const ctx = canvas.getContext("2d");

    // Draw background
    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

    // Draw avatars in circles
    ctx.save();
    ctx.beginPath();
    ctx.arc(200, 250, 90, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(img1, 110, 160, 180, 180);
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.arc(600, 250, 90, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(img2, 510, 160, 180, 180);
    ctx.restore();

    // Draw names and title
    ctx.font = "28px Arial";
    ctx.fillStyle = "#ff69b4";
    ctx.textAlign = "center";
    ctx.fillText(`${name1} 🧸 ${name2}`, 400, 470);
    ctx.font = "30px Comic Sans MS";
    ctx.fillText("💖 Cute Pair of the Chat 💖", 400, 50);

    const filePath = path.join(__dirname, "cache", `cutepair-${event.senderID}.png`);
    fs.writeFileSync(filePath, canvas.toBuffer("image/png"));

    api.sendMessage({
      body: `✨ Here's a cute pair! ✨\n👩‍❤️‍👨 ${name1} & ${name2} look so adorable together!`,
      attachment: fs.createReadStream(filePath)
    }, event.threadID, () => fs.unlinkSync(filePath));
  FanFananFanFanananan
