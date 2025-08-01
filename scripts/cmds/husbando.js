const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "husbando",
    aliases: ["animehusbando", "aboy", "hub"],
    version: "1.0",
    author: "eran",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Send a random husbando image",
    },
    longDescription: {
      en: "Fetches and sends a random anime husbando (male anime character) image.",
    },
    category: "anime",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ api, event }) {
    try {
      const res = await axios.get("https://nekos.best/api/v2/husbando"); // Example API
      const imgURL = res.data.results[0].url;

      const imgPath = path.join(__dirname, "cache", `husbando.jpg`);
      const response = await axios.get(imgURL, { responseType: "arraybuffer" });
      fs.ensureDirSync(path.dirname(imgPath));
      fs.writeFileSync(imgPath, Buffer.from(response.data, "utf-8"));

      await api.sendMessage({
        body: "Here's your random husbando 💙",
        attachment: fs.createReadStream(imgPath)
      }, event.threadID, () => fs.unlinkSync(imgPath), event.messageID);

    } catch (error) {
      console.error(error);
      api.sendMessage("❌ Failed to fetch husbando image. Try again later.", event.threadID, event.messageID);
    }
  }
};
