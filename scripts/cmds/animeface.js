const { loadImage, createCanvas } = require("canvas");
const fs = require("fs-extra");
const path = require("path");

function posterize(data, levels = 6) {
  // Reduce colors for a cartoon effect
  const step = 255 / (levels - 1);
  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.round(data[i] / step) * step;       // R
    data[i + 1] = Math.round(data[i + 1] / step) * step; // G
    data[i + 2] = Math.round(data[i + 2] / step) * step; // B
  }
}

module.exports = {
  config: {
    name: "animeface",
    version: "1.0",
    author: "eran",
    countDown: 5,
    role: 0,
    shortDescription: "Apply cartoon/anime style filter on avatar",
    longDescription: "Simulates an anime/cartoon style effect on a user's profile picture",
    category: "image",
    guide: "{pn} [@mention or blank for self]"
  },

  onStart: async function ({ message, event, usersData }) {
    const mention = Object.keys(event.mentions)[0] || event.senderID;
    const userName = (await usersData.getName(mention)).split(" ")[0];

    const avatarURL = `https://graph.facebook.com/${mention}/picture?width=512&height=512`;
    const avatarPath = path.join(__dirname, "cache", `${mention}_avatar.png`);
    const outputPath = path.join(__dirname, "cache", `${mention}_animeface.png`);

    await global.utils.downloadFile(avatarURL, avatarPath);
    const img = await loadImage(avatarPath);

    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext("2d");

    ctx.drawImage(img, 0, 0);

    // Get pixel data
    const imageData = ctx.getImageData(0, 0, img.width, img.height);
    const data = imageData.data;

    // Apply posterize effect to simulate cartoon
    posterize(data, 6);

    // Slightly boost saturation and contrast (optional)
    for (let i = 0; i < data.length; i += 4) {
      // Increase saturation and contrast by adjusting RGB
      data[i] = Math.min(255, data[i] * 1.1);     // R
      data[i + 1] = Math.min(255, data[i + 1] * 1.05); // G
      data[i + 2] = Math.min(255, data[i + 2] * 1.1);  // B
    }

    ctx.putImageData(imageData, 0, 0);

    const buffer = canvas.toBuffer();
    fs.writeFileSync(outputPath, buffer);

    message.reply({
      body: `✨ Here's the anime-style avatar of ${userName}:`,
      attachment: fs.createReadStream(outputPath)
    }, () => {
      fs.unlinkSync(avatarPath);
      fs.unlinkSync(outputPath);
    });
  }
};
