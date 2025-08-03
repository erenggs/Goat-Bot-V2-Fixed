const { loadImage, createCanvas } = require("canvas");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "mirror",
    version: "1.0",
    author: "eran",
    countDown: 5,
    role: 0,
    shortDescription: "Mirror (flip horizontally) avatar image",
    longDescription: "Flips the profile picture horizontally to create a mirror effect",
    category: "image",
    guide: "{pn} [@mention or blank for self]"
  },

  onStart: async function ({ message, event, usersData }) {
    const mention = Object.keys(event.mentions)[0] || event.senderID;
    const userName = (await usersData.getName(mention)).split(" ")[0];

    const avatarURL = `https://graph.facebook.com/${mention}/picture?width=512&height=512`;
    const avatarPath = path.join(__dirname, "cache", `${mention}_avatar.png`);
    const outputPath = path.join(__dirname, "cache", `${mention}_mirror.png`);

    await global.utils.downloadFile(avatarURL, avatarPath);
    const img = await loadImage(avatarPath);

    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext("2d");

    // Flip horizontally (mirror)
    ctx.translate(img.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(img, 0, 0);

    const buffer = canvas.toBuffer();
    fs.writeFileSync(outputPath, buffer);

    message.reply({
      body: `🪞 Here's the mirrored photo of ${userName}:`,
      attachment: fs.createReadStream(outputPath)
    }, () => {
      fs.unlinkSync(avatarPath);
      fs.unlinkSync(outputPath);
    });
  }
};
