const axios = require("axios");
const fs = require("fs-extra");
const { loadImage, createCanvas } = require("canvas");

module.exports = {
  config: {
    name: "manipulate",
    aliases: ["gray", "grayscale"],
    version: "1.0",
    author: "eran",
    countDown: 5,
    role: 0,
    shortDescription: "Apply grayscale to profile pic",
    longDescription: "Grayscale filter on user profile picture",
    category: "image",
    guide: "{pn} [mention/reply]",
  },

  onStart: async function ({ api, event, args }) {
    try {
      const uid = event.type === "message_reply"
        ? event.messageReply.senderID
        : Object.keys(event.mentions)[0] || event.senderID;

      const avatarUrl = `https://graph.facebook.com/${uid}/picture?width=512&height=512`;
      const response = await axios.get(avatarUrl, { responseType: "arraybuffer" });
      const image = await loadImage(response.data);

      const canvas = createCanvas(image.width, image.height);
      const ctx = canvas.getContext("2d");
      ctx.drawImage(image, 0, 0);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i+1] + data[i+2]) / 3;
        data[i] = data[i+1] = data[i+2] = avg;
      }

      ctx.putImageData(imageData, 0, 0);

      const outputPath = __dirname + "/gray.png";
      const buffer = canvas.toBuffer("image/png");
      fs.writeFileSync(outputPath, buffer);

      api.sendMessage(
        { body: "🖤 Grayscale applied!", attachment: fs.createReadStream(outputPath) },
        event.threadID,
        () => fs.unlinkSync(outputPath),
        event.messageID
      );

    } catch (error) {
      console.error(error);
      api.sendMessage("❌ Failed to manipulate image.", event.threadID);
    }
  }
};
