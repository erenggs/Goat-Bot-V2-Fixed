const { loadImage, createCanvas } = require("canvas");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "oldify",
    version: "1.0",
    author: "eran",
    countDown: 5,
    role: 0,
    shortDescription: "Apply aging effect on avatar",
    longDescription: "Simulates an old age effect by applying sepia and wrinkle overlay on profile picture",
    category: "image",
    guide: "{pn} [@mention or blank for self]"
  },

  onStart: async function ({ message, event, usersData }) {
    const mention = Object.keys(event.mentions)[0] || event.senderID;
    const userName = (await usersData.getName(mention)).split(" ")[0];

    const avatarURL = `https://graph.facebook.com/${mention}/picture?width=512&height=512`;
    const avatarPath = path.join(__dirname, "cache", `${mention}_avatar.png`);
    const outputPath = path.join(__dirname, "cache", `${mention}_oldify.png`);

    // You need a wrinkle texture PNG overlay with transparent background
    const wrinkleOverlayPath = path.join(__dirname, "assets", "wrinkles.png");

    await global.utils.downloadFile(avatarURL, avatarPath);

    const avatar = await loadImage(avatarPath);
    const wrinkles = await loadImage(wrinkleOverlayPath);

    const canvas = createCanvas(512, 512);
    const ctx = canvas.getContext("2d");

    // Draw avatar
    ctx.drawImage(avatar, 0, 0, 512, 512);

    // Apply sepia filter
    const imageData = ctx.getImageData(0, 0, 512, 512);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      // sepia formula
      data[i]     = Math.min(255, (r * .393) + (g * .769) + (b * .189));
      data[i + 1] = Math.min(255, (r * .349) + (g * .686) + (b * .168));
      data[i + 2] = Math.min(255, (r * .272) + (g * .534) + (b * .131));
    }
    ctx.putImageData(imageData, 0, 0);

    // Draw wrinkle overlay with some transparency
    ctx.globalAlpha = 0.4;
    ctx.drawImage(wrinkles, 0, 0, 512, 512);
    ctx.globalAlpha = 1;

    const buffer = canvas.toBuffer();
    fs.writeFileSync(outputPath, buffer);

    message.reply({
      body: `👴 Here's the oldified image of ${userName}:`,
      attachment: fs.createReadStream(outputPath)
    }, () => {
      fs.unlinkSync(avatarPath);
      fs.unlinkSync(outputPath);
    });
  }
};
