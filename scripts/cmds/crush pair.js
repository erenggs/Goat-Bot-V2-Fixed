const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

module.exports = {
  config: {
    name: "crushpair",
    version: "1.0",
    author: "eran",
    countDown: 5,
    role: 0,
    shortDescription: "💘 Crush pair of the day",
    longDescription: "Randomly selects two people and shows them as secret crush pair",
    category: "love",
    guide: "{pn}"
  },

  onStart: async function ({ api, event, usersData }) {
    const threadInfo = await api.getThreadInfo(event.threadID);
    const members = threadInfo.participantIDs.filter(id => id !== api.getCurrentUserID());

    if (members.length < 2) {
      return api.sendMessage("❗ Not enough members to find a crush pair!", event.threadID);
    }

    const [id1, id2] = members.sort(() => Math.random() - 0.5).slice(0, 2);
    const user1 = await usersData.get(id1);
    const user2 = await usersData.get(id2);

    const name1 = user1.name;
    const name2 = user2.name;

    const avatar1 = `https://graph.facebook.com/${id1}/picture?width=512&height=512`;
    const avatar2 = `https://graph.facebook.com/${id2}/picture?width=512&height=512`;
    const bgURL = "https://i.imgur.com/I7ZTxmV.jpg"; // Cute/Flirty pink hearts background

    const [img1, img2, bg] = await Promise.all([
      loadImage(avatar1),
      loadImage(avatar2),
      loadImage(bgURL)
    ]);

    const canvas = createCanvas(800, 500);
    const ctx = canvas.getContext("2d");

    // Background
    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

    // Draw circular avatars
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

    // Text
    ctx.font = "30px Arial";
    ctx.fillStyle = "#ff3366";
    ctx.textAlign = "center";
    ctx.fillText(`${name1} 💌 ${name2}`, 400, 460);
    ctx.font = "28px Comic Sans MS";
    ctx.fillText("🌸 Secret Crush Pair 🌸", 400, 50);

    const outputPath = path.join(__dirname, "cache", `crushpair-${event.senderID}.png`);
    fs.writeFileSync(outputPath, canvas.toBuffer("image/png"));

    api.sendMessage({
      body: `💌 A secret crush is revealed!\n💘 ${name1} has a crush on ${name2}... or maybe both do! 👀`,
      attachment: fs.createReadStream(outputPath)
    }, event.threadID, () => fs.unlinkSync(outputPath));
  }
};
