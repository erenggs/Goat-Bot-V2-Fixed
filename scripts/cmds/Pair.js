const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "pair",
    aliases: [],
    version: "1.0",
    author: "eran_hossain",
    countDown: 5,
    role: 0,
    shortDescription: "জুটি তৈরি করুন",
    longDescription: "গ্রুপের একজন ইউজারের সাথে র‍্যান্ডম অন্য একজনকে জুটি করে মজা নিন",
    category: "image",
    guide: "{pn}"
  },

  onStart: async function({ api, event, threadsData, usersData }) {
    try {
      const { threadID, senderID } = event;
      const { participantIDs } = await api.getThreadInfo(threadID);

      const botID = api.getCurrentUserID();
      const listUserID = participantIDs.filter(ID => ID !== botID && ID !== senderID);

      if (listUserID.length === 0) {
        return api.sendMessage("জুটি বানানোর মতো আর কেউ নেই এখানে।", threadID);
      }

      const matchedID = listUserID[Math.floor(Math.random() * listUserID.length)];
      const senderName = (await usersData.get(senderID)).name;
      const matchedName = (await usersData.get(matchedID)).name;

      const tags = [
        { id: senderID, tag: senderName },
        { id: matchedID, tag: matchedName }
      ];

      const cacheDir = path.join(__dirname, "cache");
      const avt1Path = path.join(cacheDir, "avt1.png");
      const avt2Path = path.join(cacheDir, "avt2.png");
      const gifPath = path.join(cacheDir, "giflove.gif");

      const fbToken = "6628568379|c1e620fa708a1d5696fb991c1bde5662";

      const [avt1, avt2, gif] = await Promise.all([
        axios.get(`https://graph.facebook.com/${senderID}/picture?width=512&height=512&access_token=${fbToken}`, { responseType: "arraybuffer" }),
        axios.get(`https://graph.facebook.com/${matchedID}/picture?width=512&height=512&access_token=${fbToken}`, { responseType: "arraybuffer" }),
        axios.get("https://i.ibb.co/y4dWfQq/image.gif", { responseType: "arraybuffer" })
      ]);

      fs.writeFileSync(avt1Path, Buffer.from(avt1.data));
      fs.writeFileSync(avt2Path, Buffer.from(avt2.data));
      fs.writeFileSync(gifPath, Buffer.from(gif.data));

      const compatibility = Math.floor(Math.random() * 101);

      const message = {
        body: `🥰 জুটি সফল হয়েছে!\n💌 তোমাদের সুখী হোক দুই শত বছর\n💕 মিলের হার: ${compatibility}%\n${senderName} 💓 ${matchedName}`,
        mentions: tags,
        attachment: [
          fs.createReadStream(avt1Path),
          fs.createReadStream(gifPath),
          fs.createReadStream(avt2Path)
        ]
      };

      return api.sendMessage(message, threadID, event.messageID);

    } catch (error) {
      console.error("Pair command error:", error);
      return api.sendMessage("জুটি বানাতে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।", event.threadID);
    }
  }
};
