Goatbot-v2 coding API anime coupleDp cdp.js
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
config: {
name: "coupledp2",
aliases: ["cdp"],
version: "1.0",
author: "eran_hossain",
countDown: 5,
role: 0,
shortDescription: "Anime couple (gf & bf) image",
longDescription: "Sends a random anime couple display picture (girl and boy together).",
category: "image",
guide: "{pn}"
},

onStart: async function ({ api, event }) {
const url = "https://nekos.best/api/v2/couple"; // Example API

try {  
  const res = await axios.get(url);  
  const coupleImage = res.data.results?.[0]?.url;  

  if (!coupleImage) {  
    return api.sendMessage("❌ Couldn't fetch couple image.", event.threadID, event.messageID);  
  }  

  const imagePath = path.join(__dirname, "cache", "coupledp.jpg");  
  const imageData = await axios.get(coupleImage, { responseType: "arraybuffer" });  
  fs.ensureDirSync(path.dirname(imagePath));  
  fs.writeFileSync(imagePath, imageData.data);  

  api.sendMessage({  
    body: "💑 Here's a random anime couple!",  
    attachment: fs.createReadStream(imagePath)  
  }, event.threadID, () => fs.unlinkSync(imagePath), event.messageID);  

} catch (err) {  
  console.error(err);  
  api.sendMessage("⚠️ Error fetching couple image.", event.threadID, event.messageID);  
}

}
};

