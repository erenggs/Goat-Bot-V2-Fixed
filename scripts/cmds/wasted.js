const { loadImage, createCanvas } = require("canvas");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "wasted",
    version: "1.0",
    author: "eran",
    countDown: 5,
    role: 0,
    shortDescription: "Add WASTED overlay on avatar",
    longDescription: "Adds the iconic red WASTED text overlay on a user's profile picture",
    category: "image",
    guide: "{pn} [@mention or blank for self]"
  },

  onStart: async function ({ message, event, usersData }) {
    const mention = Object.keys(event.mentions)[0] || event.senderID;
    const userName = (await usersData.getName(mention)).split(" ")[0];

    const avatarURL = `https://graph.facebook.com/${mention}/picture?width=512&height=512`;
    const avatarPath = path.join(__dirname, "cache", `${mention}_avatar.png`);
    const outputPath = path.join(__dirname, "cache", `${mention}_wasted.png`);

    // You need a 'wasted.png' overlay image with transparent background in assets folder
    const wastedOverlayPath = path.join(__dirname, "assets", "wasted.png");

    await global.utils.downloadFile(avatarURL, avatarPath);

    const avatar = await loadImage(avatarPath);
    const wastedOverlay = await loadImage(wastedOverlayPath);

    const canvas = createCanvas(512, 512);
    const ctx = canvas.getContext("2d");

    // Draw avatar
    ctx.drawImage(avatar, 0, 0, 512, 512);

    // Draw WASTED overlay (scaled to fit)
    ctx.drawImage(wastedOverlay, 0, 0, 512, 512);

    const buffer = canvas.toBuffer();
    fs.writeFileSync(outputPath, buffer);

    message.reply({
      body: `💥 WASTED, ${userName}!`,
      attachment: fs.createReadStream(outputPath)
    }, () => {
      fs.unlinkSync(avatarPath);
      fs.unlinkSync(outputPath);
    });
  }
};
