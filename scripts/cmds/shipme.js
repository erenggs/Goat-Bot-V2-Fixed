const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

module.exports = {
  config: {
    name: "shipme",
    version: "1.0",
    author: "eran",
    countDown: 5,
    role: 0,
    shortDescription: "🚢 Ship yourself with someone",
    longDescription: "Matches the sender with a random user in the group and shows the result",
    category: "love",
    guide: "{pn}"
  },

  onStart: async function ({ api, event, usersData }) {
    const senderID = event.senderID;
    const threadInfo = await api.getThreadInfo(event.threadID);

    const members = threadInfo.participantIDs.filter(id => id !== api.getCurrentUserID() && id !== senderID);

    if (members.length === 0) {
      return api.sendMessage("❗ No one else to ship you with!", event.threadID);
    }

    const partnerID = members[Math.floor(Math.random() * members.length)];

    const senderData = await usersData.get(senderID);
    const partnerData = await usersData.get(partnerID);

    const name1 = senderData.name;
    const name2 = partnerData.name;

    const avatar1 = `https://graph.facebook.com/${senderID}/picture?width=512&height=512`;
    const avatar2 = `https://graph.facebook.com/${partnerID}/picture?width=512&height=512`;
    const bgURL = "https://i.imgur.com/Ep4GQKr.jpg"; // Love ship background

    const [img1, img2, bg] = await Promise.all([
      loadImage(avatar1),
      loadImage(avatar2),
      loadImage(bgURL)
    ]);

    const loveScore = Math.floor(Math.random() * 51) + 50; // Between 50 and 100

    const canvas = createCanvas(800, 500);
    const ctx = canvas.getContext("2d");

    // Draw background
    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

    // Draw profile pics
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

    // Add names and love %
    ctx.font = "30px Arial";
    ctx.fillStyle = "#ff66cc";
    ctx.textAlign = "center";
    ctx.fillText(`${name1} ❤️ ${name2}`, 400, 460);
    ctx.fillText(`💘 Love Score: ${loveScore}%`, 400, 420);
    ctx.font = "28px Georgia";
    ctx.fillText("🚢 Ship Match Detected 🚢", 400, 50);

    const outputPath = path.join(__dirname, "cache", `shipme-${senderID}.png`);
    fs.writeFileSync(outputPath, canvas.toBuffer("image/png"));

    api.sendMessage({
      body: `❤️ ${name1} has been shipped with ${name2}!\n💞 Love Score: ${loveScore}%`,
      attachment: fs.createReadStream(outputPath)
    }, event.threadID, () => fs.unlinkSync(outputPath));
  }
};
