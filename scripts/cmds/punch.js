const { loadImage, createCanvas } = require("canvas");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "punch",
    version: "1.0",
    author: "eran",
    countDown: 7,
    role: 0,
    shortDescription: "Create a punch image from two avatars",
    longDescription: "Shows two user avatars with a punch emoji between them",
    category: "image",
    guide: "{pn} @user1 @user2"
  },

  onStart: async function ({ message, event, usersData }) {
    const mentions = Object.keys(event.mentions);
    if (mentions.length < 2) {
      return message.reply("❌ Please mention two users to punch!");
    }

    const user1ID = mentions[0];
    const user2ID = mentions[1];

    const user1Name = (await usersData.getName(user1ID)).split(" ")[0];
    const user2Name = (await usersData.getName(user2ID)).split(" ")[0];

    const size = 256;
    const width = size * 2 + 60; // 60 px gap for punch emoji
    const height = size;

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    const avatar1URL = `https://graph.facebook.com/${user1ID}/picture?width=${size}&height=${size}`;
    const avatar2URL = `https://graph.facebook.com/${user2ID}/picture?width=${size}&height=${size}`;

    const avatar1Path = path.join(__dirname, "cache", `${user1ID}_avatar.png`);
    const avatar2Path = path.join(__dirname, "cache", `${user2ID}_avatar.png`);
    const outputPath = path.join(__dirname, "cache", `${user1ID}_${user2ID}_punch.png`);

    await Promise.all([
      global.utils.downloadFile(avatar1URL, avatar1Path),
      global.utils.downloadFile(avatar2URL, avatar2Path)
    ]);

    const avatar1 = await loadImage(avatar1Path);
    const avatar2 = await loadImage(avatar2Path);

    // Draw left avatar
    ctx.drawImage(avatar1, 0, 0, size, size);

    // Draw right avatar
    ctx.drawImage(avatar2, size + 60, 0, size, size);

    // Draw punch emoji in the center
    ctx.font = "bold 80px Arial";
    ctx.fillText("👊", size + 30, height / 2 + 20);

    const buffer = canvas.toBuffer();
    fs.writeFileSync(outputPath, buffer);

    message.reply({
      body: `👊 ${user1Name} punched ${user2Name}!`,
      attachment: fs.createReadStream(outputPath)
    }, () => {
      fs.unlinkSync(avatar1Path);
      fs.unlinkSync(avatar2Path);
      fs.unlinkSync(outputPath);
    });
  }
};
