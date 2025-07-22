const axios = require("axios");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "pair5",
    version: "1.0.0",
    author: "eran",
    countDown: 10,
    role: 0,
    shortDescription: "Find your GF/BF ❤️",
    longDescription: "Pairs a male user with a random female and vice versa, showing their photos and love percentage.",
    category: "love",
    guide: "{pn}"
  },

  onStart: async function ({ api, event, usersData }) {
    try {
      const { threadID, senderID } = event;

      const threadInfo = await api.getThreadInfo(threadID);
      const allUsers = threadInfo.userInfo;

      const botID = api.getCurrentUserID();

      const senderInfo = allUsers.find(u => u.id === senderID);
      if (!senderInfo || !senderInfo.gender) {
        return api.sendMessage("⚠️ Cannot determine your gender, pairing failed.", threadID);
      }

      const senderGender = senderInfo.gender;
      let matchCandidates;

      if (senderGender === "MALE") {
        matchCandidates = allUsers.filter(
          user => user.gender === "FEMALE" && user.id !== botID && user.id !== senderID
        );
      } else if (senderGender === "FEMALE") {
        matchCandidates = allUsers.filter(
          user => user.gender === "MALE" && user.id !== botID && user.id !== senderID
        );
      } else {
        return api.sendMessage("⚠️ Unsupported gender for pairing.", threadID);
      }

      if (matchCandidates.length === 0) {
        return api.sendMessage("😢 No suitable GF/BF found in this group.", threadID);
      }

      const chosenUser = matchCandidates[Math.floor(Math.random() * matchCandidates.length)];

      const senderName = (await usersData.get(senderID)).name;
      const chosenName = (await usersData.get(chosenUser.id)).name;

      const lovePercent = Math.floor(Math.random() * 101);

      const senderPicUrl = `https://graph.facebook.com/${senderID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
      const chosenPicUrl = `https://graph.facebook.com/${chosenUser.id}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

      const senderPic = (await axios.get(senderPicUrl, { responseType: "arraybuffer" })).data;
      const chosenPic = (await axios.get(chosenPicUrl, { responseType: "arraybuffer" })).data;

      const senderPath = `${__dirname}/cache/gf1.png`;
      const chosenPath = `${__dirname}/cache/gf2.png`;

      fs.writeFileSync(senderPath, Buffer.from(senderPic));
      fs.writeFileSync(chosenPath, Buffer.from(chosenPic));

      const message = {
        body: `💘 Perfect Match Found 💘\n\n🌹 ${senderName} + ${chosenName}\n💞 Love Score: ${lovePercent}%\n💑 You two look cute together!`,
        mentions: [
          { id: senderID, tag: senderName },
          { id: chosenUser.id, tag: chosenName }
        ],
        attachment: [
          fs.createReadStream(senderPath),
          fs.createReadStream(chosenPath)
        ]
      };

      api.sendMessage(message, threadID, () => {
        fs.unlinkSync(senderPath);
        fs.unlinkSync(chosenPath);
      });

    } catch (err) {
      console.error("Pairing error:", err);
      api.sendMessage("❌ An error occurred while finding your GF/BF.", event.threadID);
    }
  }
};
