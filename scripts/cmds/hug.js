const { loadImage, createCanvas } = require("canvas");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "hug",
    version: "1.0",
    author: "eran",
    countDown: 7,
    role: 0,
    shortDescription: "Create a hug image from two avatars",
    longDescription: "Combines two user avatars with a heart overlay to simulate a hug",
    category: "image",
    guide: "{pn} @user1 @user2"
  },

  onStart: async function ({ message, event, usersData }) {
    const mentions = Object.keys(event.mentions);
    if (mentions.length < 2) {
      return message.reply("❌ Please mention two users to hug!");
    }

    const user1ID = mentions[0];
    const user2ID = mentions[1];

    const user1Name = (await usersData.getName(user1ID)).split(" ")[0];
    const user2Name = (await usersData.getName(user2ID)).split(" ")[0];

    const size = 256;
    const width = size * 2 + 60; // 60 px gap for heart
    const height = size;

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    const avatar1URL = `https://graph.facebook.com/${user1ID}/picture?width=${size}&height=${size}`;
    const avatar2URL = `https://graph.facebook.com/${user2ID}/picture?width=${size}&height=${size}`;

    const avatar1Path = path.join(__dirname, "cache", `${user1ID}_avatar.png`);
    const avatar2Path = path.join(__dirname, "cache", `${user2ID}_avatar.png`);
    const outputPath = path.join(__dirname, "cache", `${user1ID}_${user2ID}_hug.png`);

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

    // Draw heart in the center
    ctx.fillStyle = "#FF0000";
    ctx.font = "bold 80px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("❤️", size + 30, height / 2);

    const buffer = canvas.toBuffer();
    fs.writeFileSync(outputPath, buffer);

    message.reply({
      body: `🤗 ${user1Name} hugged ${user2Name}!`,
      attachment: fs.createReadStream(outputPath)
    }, () => {
      fs.unlinkSync(avatar1Path);
      fs.unlinkSync(avatar2Path);
      fs.unlinkSync(outputPath);
    });
  }
};
