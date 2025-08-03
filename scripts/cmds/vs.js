const { loadImage, createCanvas } = require("canvas");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "vs",
    version: "1.0",
    author: "eran",
    countDown: 7,
    role: 0,
    shortDescription: "Create a VS image from two avatars",
    longDescription: "Places two user avatars side by side with a big VS text in the center",
    category: "image",
    guide: "{pn} @user1 @user2"
  },

  onStart: async function ({ message, event, api, args, usersData }) {
    // Get mentions
    const mentions = Object.keys(event.mentions);
    if (mentions.length < 2) {
      return message.reply("❌ Please mention two users to compare!");
    }

    const user1ID = mentions[0];
    const user2ID = mentions[1];

    const user1Name = (await usersData.getName(user1ID)).split(" ")[0];
    const user2Name = (await usersData.getName(user2ID)).split(" ")[0];

    const size = 256;
    const width = size * 2 + 100; // 100px space for VS text
    const height = size;

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    const avatar1URL = `https://graph.facebook.com/${user1ID}/picture?width=${size}&height=${size}`;
    const avatar2URL = `https://graph.facebook.com/${user2ID}/picture?width=${size}&height=${size}`;

    const avatar1Path = path.join(__dirname, "cache", `${user1ID}_avatar.png`);
    const avatar2Path = path.join(__dirname, "cache", `${user2ID}_avatar.png`);
    const outputPath = path.join(__dirname, "cache", `${user1ID}_${user2ID}_vs.png`);

    await Promise.all([
      global.utils.downloadFile(avatar1URL, avatar1Path),
      global.utils.downloadFile(avatar2URL, avatar2Path),
    ]);

    const avatar1 = await loadImage(avatar1Path);
    const avatar2 = await loadImage(avatar2Path);

    // Draw left avatar
    ctx.drawImage(avatar1, 0, 0, size, size);

    // Draw right avatar
    ctx.drawImage(avatar2, size + 100, 0, size, size);

    // Draw VS text
    ctx.fillStyle = "#FF0000";
    ctx.font = "bold 80px Impact";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("VS", size + 50, height / 2);

    // Optionally add user names under avatars
    ctx.font = "bold 24px Arial";
    ctx.fillStyle = "#000000";
    ctx.fillText(user1Name, size / 2, height - 20);
    ctx.fillText(user2Name, size + 100 + size / 2, height - 20);

    const buffer = canvas.toBuffer();
    fs.writeFileSync(outputPath, buffer);

    message.reply({
      body: `⚔️ Here's the VS image of ${user1Name} vs ${user2Name}:`,
      attachment: fs.createReadStream(outputPath),
    }, () => {
      fs.unlinkSync(avatar1Path);
      fs.unlinkSync(avatar2Path);
      fs.unlinkSync(outputPath);
    });
  }
};
