const axios = require("axios");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "anicouple",
    aliases: ["animecouple", "acouple"],
    version: "1.0",
    author: "eran",
    countDown: 6,
    role: 0,
    shortDescription: {
      en: "Send a random anime couple photo",
    },
    longDescription: {
      en: "Sends a cute or romantic anime couple image to the chat",
    },
    category: "anime",
    guide: {
      en: "{p}anicouple",
    },
  },

  onStart: async function ({ message }) {
    try {
      const response = await axios.get(
        "https://nekos.best/api/v2/couple", // Example API endpoint
        { responseType: "json" }
      );

      const imageUrl = response.data.results[0].url;
      const imageStream = (await axios.get(imageUrl, { responseType: "stream" })).data;

      const path = __dirname + "/cache/anicouple.jpg";
      await new Promise((resolve, reject) => {
        const writer = fs.createWriteStream(path);
        imageStream.pipe(writer);
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

      message.reply({
        body: "Here's a sweet anime couple for you ❤️",
        attachment: fs.createReadStream(path),
      });
    } catch (error) {
      console.error(error);
      message.reply("❌ Couldn't fetch anime couple image. Try again later.");
    }
  },
};
