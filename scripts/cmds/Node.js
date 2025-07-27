const express = require("express");
const Jimp = require("jimp");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("🌀 Welcome to the Blur API! Use /blur?image=IMAGE_URL");
});

app.get("/blur", async (req, res) => {
  const imageUrl = req.query.image;

  if (!imageUrl) {
    return res.status(400).json({ error: "Missing 'image' query parameter." });
  }

  try {
    const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
    const image = await Jimp.read(response.data);

    image.blur(10); // You can change the blur intensity here

    const buffer = await image.getBufferAsync(Jimp.MIME_PNG);
    res.set("Content-Type", "image/png");
    res.send(buffer);
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Failed to process image." });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Blur API running at http://localhost:${PORT}`);
});
