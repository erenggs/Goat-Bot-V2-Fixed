const { loadImage, createCanvas } = require("canvas");
const fs = require("fs-extra");
const path = require("path");

function applyGlow(ctx, width, height, intensity = 15) {
  ctx.shadowColor = "rgba(255, 220, 220, 0.6)";
  ctx.shadowBlur = intensity;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.globalAlpha = 0.6;
  ctx.fillRect(0, 0, width, height);
  ctx.globalAlpha = 1;
}

module.exports = {
  config: {
    name: "babyface",
    version: "1.0",
    author: "eran",
    countDown: 5,
    role: 0,
    shortDescription: "Simulate babyface effect on avatar",
    longDescription: "Smooths and softens the avatar to simulate a babyface effect",
    category: "image",
    guide: "{pn} [@mention or blank for self]"
  },

  onStart: async function ({ message, event, usersData }) {
    const mention = Object.keys(event.mentions)[0] || event.senderID;
    const userName = (await usersData.getName(mention)).split(" ")[0];

    const avatarURL = `https://graph.facebook.com/${mention}/picture?width=512&height=512`;
    const avatarPath = path.join(__dirname, "cache", `${mention}_avatar.png`);
    const outputPath = path.join(__dirname, "cache", `${mention}_babyface.png`);

    await global.utils.downloadFile(avatarURL, avatarPath);
    const img = await loadImage(avatarPath);

    const canvas = createCanvas(512, 512);
    const ctx = canvas.getContext("2d");

    // Draw avatar with slight blur to simulate smooth skin (basic approach)
    ctx.filter = "blur(2px)";
    ctx.drawImage(img, 0, 0, 512, 512);

    // Overlay the original image slightly transparent to retain detail
    ctx.globalAlpha = 0.7;
    ctx.filter = "none";
    ctx.drawImage(img, 0, 0, 512, 512);
    ctx.globalAlpha = 1;

    // Apply soft glow
    applyGlow(ctx, 512, 512, 20);

    const buffer = canvas.toBuffer();
    fs.writeFileSync(outputPath, buffer);

    message.reply({
      body: `👶 Here's your babyface avatar, ${userName}!`,
      attachment: fs.createReadStream(outputPath)
    }, () => {
      fs.unlinkSync(avatarPath);
      fs.unlinkSync(outputPath);
    });
  }
};
