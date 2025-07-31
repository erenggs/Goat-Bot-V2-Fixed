const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

module.exports = {
  config: {
    name: "kissmatch",
    version: "1.0",
    author: "eran",
    countDown: 5,
    role: 0,
    shortDescription: "💋 Kiss match between two users",
    longDescription: "Randomly chooses two people and shows a romantic kiss match result",
    category: "love",
    guide: "{pn}"
  },

  onStart: async function ({ api, event, usersData }) {
    const threadInfo = await api.getThreadInfo(event.threadID);
    const members = threadInfo.participantIDs.filter(id => id !== api.getCurrentUserID());

    if (members.length < 2) {
      return api.sendMessage("❗ Not enough people to create a kiss match!", event.threadID);
    }

    // Choose two random members
    const [id1, id2] = members.sort(() => Math.random() - 0.5).slice(0, 2);
    const user1 = await usersData.get(id1);
    const user2 = await usersData.get(id2);

    const name1 = user1.name;
    const name2 = user2.name;

    const avatar1 = `https://graph.facebook.com/${id1}/picture?width=512&height=512`;
    const avatar2 = `https://graph.facebook.com/${id2}/picture?width=512&height=512`;
    const bgURL = "https://i.imgur.com/gjU7lMK.jpg"; // Romantic kiss theme background

    const [img1, img2, bg] = await Promise.all([
      loadImage(avatar1),
      loadImage(avatar2),
      loadImage(bgURL)
    ]);

    const canvas = createCanvas(800, 500);
    const ctx = canvas.getContext("2d");

    // Draw background
    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

    // Draw profile pictures in circle format
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
    ctx.font = "30px Arial";
    ctx.fillStyle = "#ff3366";
    ctx.textAlign = "center";
    ctx.fillText(`${name1} 💋 ${name2}`, 400, 460);
    ctx.font = "28px Georgia";
    ctx.fillText("💞 Kiss Match of the Day 💞", 400, 50);

    const filePath = path.join(__dirname, "cache", `kissmatch-${event.senderID}.png`);
    fs.writeFileSync(filePath, canvas.toBuffer("image/png"));

    api.sendMessage({
      body: `💋 Ooh la la! It's a perfect Kiss Match!\n💑 ${name1} & ${name2} are meant to smooch! 😘`,
      attachment: fs.createReadStream(filePath)
    }, event.threadID, () => fs.unlinkSync(filePath));
  }
};
