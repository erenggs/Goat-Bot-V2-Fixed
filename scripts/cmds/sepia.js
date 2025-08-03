const { loadImage, createCanvas } = require("canvas");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "sepia",
    version: "1.0",
    author: "eran",
    countDown: 5,
    role: 0,
    shortDescription: "Apply sepia effect to avatar",
    longDescription: "Applies a sepia filter to the profile picture of the mentioned user or yourself",
    category: "image",
    guide: "{pn} [@mention or blank for self]"
  },

  onStart: async function ({ message, event, usersData, api }) {
    const mention = Object.keys(event.mentions)[0] || event.senderID;
    const userName = (await usersData.getName(mention)).split(" ")[0];
    
    const avatarURL = `https://graph.facebook.com/${mention}/picture?width=512&height=512`;
    const imagePath = path.join(__dirname, "cache", `${mention}_avatar.png`);
    
    const res = await global.utils.downloadFile(avatarURL, imagePath);
    const img = await loadImage(imagePath);
    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext("2d");

    ctx.drawImage(img, 0, 0, img.width, img.height);

    // Apply sepia filter
    const imageData = ctx.getImageData(0, 0, img.width, img.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      data[i]     = Math.min(255, 0.393 * r + 0.769 * g + 0.189 * b); // Red
      data[i + 1] = Math.min(255, 0.349 * r + 0.686 * g + 0.168 * b); // Green
      data[i + 2] = Math.min(255, 0.272 * r + 0.534 * g + 0.131 * b); // Blue
    }
    ctx.putImageData(imageData, 0, 0);

    const outPath = path.join(__dirname, "cache", `${mention}_sepia.png`);
    const buffer = canvas.toBuffer();
    fs.writeFileSync(outPath, buffer);

    message.reply({
      body: `🟤 Here's the sepia photo of ${userName}:`,
      attachment: fs.createReadStream(outPath)
    }, () => {
      fs.unlinkSync(imagePath);
      fs.unlinkSync(outPath);
    });
  }
};
