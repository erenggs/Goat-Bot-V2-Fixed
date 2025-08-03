const { loadImage, createCanvas } = require("canvas");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "contrast",
    version: "1.0",
    author: "eran",
    countDown: 5,
    role: 0,
    shortDescription: "Apply contrast effect to avatar",
    longDescription: "Applies a contrast filter to the profile picture of the mentioned user or yourself",
    category: "image",
    guide: "{pn} [@mention or blank for self]"
  },

  onStart: async function ({ message, event, usersData }) {
    const mention = Object.keys(event.mentions)[0] || event.senderID;
    const userName = (await usersData.getName(mention)).split(" ")[0];

    const avatarURL = `https://graph.facebook.com/${mention}/picture?width=512&height=512`;
    const imagePath = path.join(__dirname, "cache", `${mention}_avatar.png`);

    await global.utils.downloadFile(avatarURL, imagePath);
    const img = await loadImage(imagePath);
    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext("2d");

    ctx.drawImage(img, 0, 0, img.width, img.height);

    // Get pixel data
    const imageData = ctx.getImageData(0, 0, img.width, img.height);
    const data = imageData.data;

    // Adjust contrast
    const contrastValue = 1.5; // 1 = no change, >1 increases, <1 decreases
    const factor = (259 * (contrastValue * 255 + 255)) / (255 * (259 - contrastValue * 255));

    for (let i = 0; i < data.length; i += 4) {
      data[i]     = truncate(factor * (data[i] - 128) + 128);     // R
      data[i + 1] = truncate(factor * (data[i + 1] - 128) + 128); // G
      data[i + 2] = truncate(factor * (data[i + 2] - 128) + 128); // B
    }

    ctx.putImageData(imageData, 0, 0);

    const outPath = path.join(__dirname, "cache", `${mention}_contrast.png`);
    const buffer = canvas.toBuffer();
    fs.writeFileSync(outPath, buffer);

    message.reply({
      body: `⚫ Here's the contrast-edited photo of ${userName}:`,
      attachment: fs.createReadStream(outPath)
    }, () => {
      fs.unlinkSync(imagePath);
      fs.unlinkSync(outPath);
    });
  }
};

function truncate(value) {
  return Math.max(0, Math.min(255, value));
}
