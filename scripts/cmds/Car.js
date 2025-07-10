const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "car",
    aliases: ["cars", "supercar"],
    version: "1.1",
    author: "yagami_fixed",
    countDown: 5,
    role: 0,
    shortDescription: "Send a random car image",
    longDescription: "Fetches a random car image from a public API and sends it",
    category: "image",
    guide: "{pn}"
  },

  onStart: async function ({ message }) {
    try {
      const response = await axios.get("https://api.unsplash.com/photos/random?query=car&client_id=demo", {
        headers: {
          // Optional, remove if not needed
        }
      });

      // fallback demo image if above fails
      const imageUrl = response.data?.urls?.regular || "https://cdn.pixabay.com/photo/2017/01/06/19/15/auto-1957037_1280.jpg";

      const imagePath = path.join(__dirname, "cache", "car.jpg");

      const imgData = await axios.get(imageUrl, { responseType: "arraybuffer" });
      fs.writeFileSync(imagePath, Buffer.from(imgData.data, "binary"));

      await message.reply({
        body: "🚗 Here's your random car image!",
        attachment: fs.createReadStream(imagePath)
      });

      fs.unlinkSync(imagePath);
    } catch (err) {
      console.error("Car image fetch error:", err.message);
      message.reply("❌ Failed to fetch a car image. Try again later.");
    }
  }
};
