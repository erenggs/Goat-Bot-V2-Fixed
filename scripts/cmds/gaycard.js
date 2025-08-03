const { loadImage, createCanvas } = require("canvas");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "gaycard",
    version: "1.0",
    author: "eran",
    countDown: 5,
    role: 0,
    shortDescription: "Generate a gay pride card with avatar",
    longDescription: "Overlays a rainbow pride flag effect and text over a user's avatar",
    category: "image",
    guide: "{pn} [@mention or blank for self]"
  },

  onStart: async function ({ message, event, usersData }) {
    const mention = Object.keys(event.mentions)[0] || event.senderID;
    const userName = (await usersData.getName(mention)).split(" ")[0];

    const avatarURL = `https://graph.facebook.com/${mention}/picture?width=512&height=512`;
    const inputPath = path.join(__dirname, "cache", `${mention}_avatar.png`);
    const outputPath = path.join(__dirname, "cache", `${mention}_gaycard.png`);

    await global.utils.downloadFile(avatarURL, inputPath);
    const img = await loadImage(inputPath);

    const canvas = createCanvas(512, 640);
    const ctx = canvas.getContext("2d");

    // Draw avatar
    ctx.drawImage(img, 0, 0, 512, 512);

    // Create rainbow pride gradient overlay
    const gradient = ctx.createLinearGradient(0, 0, 512, 512);
    gradient.addColorStop(0, "#E40303"); // Red
    gradient.addColorStop(0.15, "#FF8C00"); // Orange
    gradient.addColorStop(0.3, "#FFED00"); // Yellow
    gradient.addColorStop(0.45, "#008026"); // Green
    gradient.addColorStop(0.6, "#004DFF"); // Blue
    gradient.addColorStop(0.75, "#750787"); // Purple

    ctx.fillStyle = gradient;
    ctx.globalAlpha = 0.4;
    ctx.fillRect(0, 0, 512, 512);
    ctx.globalAlpha = 1;

    // Draw card background for text
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 512, 512, 128);

    // Write "Gay Card" title
    ctx.font = "bold 50px Arial";
    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = "center";
    ctx.fillText("🌈 Gay Card 🌈", 256, 560);

    // Write username or message
    ctx.font = "30px Arial";
    ctx.fillText(`${userName} is Proud!`, 256, 610);

    const buffer = canvas.toBuffer();
    fs.writeFileSync(outputPath, buffer);

    message.reply({
      body: `🏳️‍🌈 Here's your Gay Card, ${userName}!`,
      attachment: fs.createReadStream(outputPath)
    }, () => {
      fs.unlinkSync(inputPath);
      fs.unlinkSync(outputPath);
    });
  }
};
