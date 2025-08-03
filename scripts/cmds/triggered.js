const { loadImage, createCanvas } = require("canvas");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "triggered",
    version: "1.0",
    author: "FanFan",
    countDown: 7,
    role: 0,
    shortDescription: "Create triggered meme GIF from avatar",
    longDescription: "Applies the triggered effect (shaking + red text) on profile picture",
    category: "image",
    guide: "{pn} [@mention or blank for self]"
  },

  onStart: async function ({ message, event, usersData }) {
    const mention = Object.keys(event.mentions)[0] || event.senderID;
    const userName = (await usersData.getName(mention)).split(" ")[0];

    const avatarURL = `https://graph.facebook.com/${mention}/picture?width=256&height=256`;
    const inputPath = path.join(__dirname, "cache", `${mention}_avatar.png`);
    const outputPath = path.join(__dirname, "cache", `${mention}_triggered.gif`);

    await global.utils.downloadFile(avatarURL, inputPath);

    const img = await loadImage(inputPath);

    // Create canvas for frames
    const canvasSize = 256;
    const frameCount = 8;
    const canvas = createCanvas(canvasSize, canvasSize + 40); // extra for red bar
    const ctx = canvas.getContext("2d");

    const GIFEncoder = require("gifencoder");
    const encoder = new GIFEncoder(canvasSize, canvasSize + 40);
    const stream = fs.createWriteStream(outputPath);

    encoder.createReadStream().pipe(stream);
    encoder.start();
    encoder.setRepeat(0);
    encoder.setDelay(50);
    encoder.setQuality(10);

    // Generate frames with shaking effect
    for (let i = 0; i < frameCount; i++) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Random shake offset (-8 to +8 px)
      const dx = Math.floor(Math.random() * 16) - 8;
      const dy = Math.floor(Math.random() * 16) - 8;

      // Draw avatar with shake offset
      ctx.drawImage(img, dx, dy, canvasSize, canvasSize);

      // Draw red triggered bar
      ctx.fillStyle = "#FF0000";
      ctx.fillRect(0, canvasSize, canvasSize, 40);

      // Write TRIGGERED text in white, bold, centered
      ctx.font = "bold 30px Impact";
      ctx.fillStyle = "#FFFFFF";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("TRIGGERED", canvasSize / 2, canvasSize + 20);

      encoder.addFrame(ctx);
    }

    encoder.finish();

    stream.on("close", () => {
      message.reply({
        body: `🔥 Here's the triggered GIF of ${userName}:`,
        attachment: fs.createReadStream(outputPath)
      }, () => {
        fs.unlinkSync(inputPath);
        fs.unlinkSync(outputPath);
      });
    });
  }
};
