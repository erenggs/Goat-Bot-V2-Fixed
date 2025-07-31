const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

module.exports = {
  config: {
    name: "bestcouple",
    version: "1.0",
    author: "eran",
    countDown: 5,
    role: 0,
    shortDescription: "💑 Best couple of the day",
    longDescription: "Randomly selects and displays the best couple from the group with a cute image",
    category: "love",
    guide: "{pn}"
  },

  onStart: async function ({ api, event, usersData }) {
    const threadInfo = await api.getThreadInfo(event.threadID);
    const members = threadInfo.participantIDs.filter(id => id !== api.getCurrentUserID());

    if (members.length < 2) {
      return api.sendMessage("❗ Need at least 2 members to find the best couple!", event.threadID);
    }

    // Shuffle and select 2 random members
    const [id1, id2] = members.sort(() => 0.5 - Math.random()).slice(0, 2);
    const user1 = await usersData.get(id1);
    const user2 = await usersData.get(id2);

    const name1 = user1.name;
    const name2 = user2.name;

    const avatar1 = `https://graph.facebook.com/${id1}/picture?width=512&height=512`;
    const avatar2 = `https://graph.facebook.com/${id2}/picture?width=512&height=512`;
    const backgroundURL = "https://i.imgur.com/NbFDM9J.jpg"; // Romantic background image

    const [img1, img2, bg] = await Promise.all([
      loadImage(avatar1),
      loadImage(avatar2),
      loadImage(backgroundURL)
    ]);

    const canvas = createCanvas(800, 500);
    const ctx = canvas.getContext("2d");

    // Draw romantic background
    ctx.drawImage(bg, 0, 0, 800, 500);

    // Profile picture 1
    ctx.save();
    ctx.beginPath();
    ctx.arc(200, 250, 100, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(img1, 100, 150, 200, 200);
    ctx.restore();

    // Profile picture 2
    ctx.save();
    ctx.beginPath();
    ctx.arc(600, 250, 100, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(img2, 500, 150, 200, 200);
    ctx.restore();

    // Names and heart text
    ctx.font = "30px Arial";
    ctx.fillStyle = "#ff0066";
    ctx.textAlign = "center";
    ctx.fillText(`${name1} ❤️ ${name2}`, 400, 470);
    ctx.font = "26px Arial";
    ctx.fillText("💑 Best Couple of the Day 💑", 400, 40);

    const outputPath = path.join(__dirname, "cache", `bestcouple-${event.senderID}.png`);
    fs.writeFileSync(outputPath, canvas.toBuffer("image/png"));

    api.sendMessage({
      body: `💖 Presenting the Best Couple 💖\n💑 ${name1} ❤️ ${name2}`,
      attachment: fs.createReadStream(outputPath)
    }, event.threadID, () => fs.unlinkSync(outputPath));
  }
};
