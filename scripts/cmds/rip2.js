const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

module.exports = {
  config: {
    name: "rip2",
    version: "2.0",
    author: "eran",
    countDown: 10,
    role: 0,
    shortDescription: "Custom RIP image",
    longDescription: "Generates a RIP image with anime graveyard background",
    category: "fun",
    guide: {
      vi: "{pn} [tag | blank]",
      en: "{pn} [@tag]"
    }
  },

  onStart: async function ({ event, message, usersData }) {
    const uid = Object.keys(event.mentions)[0];
    if (!uid) return message.reply("please mention someone");

    const avatarURL = await usersData.getAvatarUrl(uid);
    const avatar = await loadImage(avatarURL);

    // 🖼️ Use uploaded image as RIP background (hosted on Imgur)
    const background = await loadImage("https://i.imgur.com/UNAjXIr.png");

    const canvas = createCanvas(background.width, background.height);
    const ctx = canvas.getContext("2d");

    // Draw background image
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    // Draw circular avatar on cross position (manually adjusted)
    const avatarSize = 100;
    const x = canvas.width / 2 - avatarSize / 2; // center horizontally
    const y = 130; // adjust vertically near the cross
    ctx.save();
    ctx.beginPath();
    ctx.arc(x + avatarSize / 2, y + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, x, y, avatarSize, avatarSize);
    ctx.restore();

    const filePath = `${__dirname}/tmp/${uid}_rip.png`;
    fs.writeFileSync(filePath, canvas.toBuffer("image/png"));
    
    message.reply({
      body: "🪦 Rest In Peace...",
      attachment: fs.createReadStream(filePath)
    }, () => fs.unlinkSync(filePath));
  }
};
