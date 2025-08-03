const { loadImage, createCanvas } = require("canvas");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "king",
    version: "1.0",
    author: "eran",
    countDown: 5,
    role: 0,
    shortDescription: "Add a golden crown on avatar",
    longDescription: "Overlays a golden crown image on top of a user's profile picture",
    category: "image",
    guide: "{pn} [@mention or blank for self]"
  },

  onStart: async function ({ message, event, usersData }) {
    const mention = Object.keys(event.mentions)[0] || event.senderID;
    const userName = (await usersData.getName(mention)).split(" ")[0];

    const avatarURL = `https://graph.facebook.com/${mention}/picture?width=512&height=512`;
    const avatarPath = path.join(__dirname, "cache", `${mention}_avatar.png`);
    const outputPath = path.join(__dirname, "cache", `${mention}_king.png`);
    
    // You need a crown PNG with transparent background in the same folder (king_crown.png)
    const crownPath = path.join(__dirname, "assets", "king_crown.png");

    await global.utils.downloadFile(avatarURL, avatarPath);

    const avatar = await loadImage(avatarPath);
    const crown = await loadImage(crownPath);

    const canvas = createCanvas(512, 512);
    const ctx = canvas.getContext("2d");

    // Draw avatar
    ctx.drawImage(avatar, 0, 0, 512, 512);

    // Draw crown on top (adjust position and size)
    const crownWidth = 300;
    const crownHeight = 150;
    const crownX = (512 - crownWidth) / 2;
    const crownY = 0; // top of image
    ctx.drawImage(crown, crownX, crownY, crownWidth, crownHeight);

    const buffer = canvas.toBuffer();
    fs.writeFileSync(outputPath, buffer);

    message.reply({
      body: `👑 Behold the king, ${userName}!`,
      attachment: fs.createReadStream(outputPath)
    }, () => {
      fs.unlinkSync(avatarPath);
      fs.unlinkSync(outputPath);
    });
  }
};
