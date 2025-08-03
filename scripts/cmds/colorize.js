const { loadImage, createCanvas } = require("canvas");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "colorize",
    version: "1.0",
    author: "eran",
    countDown: 5,
    role: 0,
    shortDescription: "AI-style color tint on avatar",
    longDescription: "Applies a simulated AI colorization (tint) effect to your or a mentioned user's profile picture",
    category: "image",
    guide: "{pn} [@mention or blank for self]"
  },

  onStart: async function ({ message, event, usersData }) {
    const mention = Object.keys(event.mentions)[0] || event.senderID;
    const userName = (await usersData.getName(mention)).split(" ")[0];

    const avatarURL = `https://graph.facebook.com/${mention}/picture?width=512&height=512`;
    const inputPath = path.join(__dirname, "cache", `${mention}_avatar.png`);
    const outputPath = path.join(__dirname, "cache", `${mention}_colorized.png`);

    await global.utils.downloadFile(avatarURL, inputPath);
    const img = await loadImage(inputPath);

    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext("2d");

    // Draw original image
    ctx.drawImage(img, 0, 0, img.width, img.height);

    // Simulated AI color tint
    ctx.fillStyle = "rgba(60, 180, 255, 0.3)"; // light blue transparent overlay
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const buffer = canvas.toBuffer();
    fs.writeFileSync(outputPath, buffer);

    message.reply({
      body: `🖼️ Here's an AI-styled colorized image of ${userName}:`,
      attachment: fs.createReadStream(outputPath)
    }, () => {
      fs.unlinkSync(inputPath);
      fs.unlinkSync(outputPath);
    });
  }
};
