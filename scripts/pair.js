const axios = require("axios");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "pair",
    version: "1.6.9",
    author: "Nazrul",
    countDown: 10,
    role: 0,
    shortDescription: "Pair users with the opposite gender",
    longDescription: "If the sender is male, they are paired with a random female, and if the sender is female, they are paired with a random male.",
    category: "love",
    guide: "{pn}"
  },

  onStart: async function ({ api, event, usersData }) {
    try {
      const { threadID, senderID } = event;

      const ThreadInfo = await api.getThreadInfo(threadID);
      const allUsers = ThreadInfo.userInfo;

      const botID = api.getCurrentUserID();

      const senderInfo = allUsers.find((user) => user.id === senderID);
      if (!senderInfo || !senderInfo.gender) {
        return api.sendMessage("Your gender is not defined, so pairing cannot proceed.", threadID);
      }

      const senderGender = senderInfo.gender;

      let oppositeGenderUsers;
      if (senderGender === "MALE") {
        oppositeGenderUsers = allUsers.filter(
          (user) => user.gender === "FEMALE" && user.id !== botID && user.id !== senderID
        );
      } else if (senderGender === "FEMALE") {
        oppositeGenderUsers = allUsers.filter(
          (user) => user.gender === "MALE" && user.id !== botID && user.id !== senderID
        );
      } else {
        return api.sendMessage("Your gender is not supported for pairing.", threadID);
      }

      if (oppositeGenderUsers.length === 0) {
        return api.sendMessage("No users of the opposite gender are available for pairing.", threadID);
      }

      const randomUser = oppositeGenderUsers[Math.floor(Math.random() * oppositeGenderUsers.length)];

      const senderName = (await usersData.get(senderID)).name;
      const randomUserName = (await usersData.get(randomUser.id)).name;

      const lovePercentage = Math.floor(Math.random() * 101);

      const senderAvatarUrl = `https://graph.facebook.com/${senderID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
      const randomUserAvatarUrl = `https://graph.facebook.com/${randomUser.id}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

      const senderAvatarData = (await axios.get(senderAvatarUrl, { responseType: "arraybuffer" })).data;
      const randomUserAvatarData = (await axios.get(randomUserAvatarUrl, { responseType: "arraybuffer" })).data;

      const senderAvatarPath = __dirname + "/cache/sender.png";
      const randomUserAvatarPath = __dirname + "/cache/random.png";

      fs.writeFileSync(senderAvatarPath, Buffer.from(senderAvatarData));
      fs.writeFileSync(randomUserAvatarPath, Buffer.from(randomUserAvatarData));

      const message = {
        body: `♡ Successfully Found a Lovely Couple!\n♡ Love Match: ${lovePercentage}%\n♡ ${senderName} ♡\n☄️ With ☄️\n♡ ${randomUserName} ♡`,
        mentions: [
          { id: senderID, tag: senderName },
          { id: randomUser.id, tag: randomUserName }
        ],
        attachment: [
          fs.createReadStream(senderAvatarPath),
          fs.createReadStream(randomUserAvatarPath)
        ]
      };

      api.sendMessage(message, threadID, () => {
        fs.unlinkSync(senderAvatarPath);
        fs.unlinkSync(randomUserAvatarPath);
      });
    } catch (error) {
      console.error("Error in pair command:", error);
      api.sendMessage("🦆💨 There is no love on your forehead.", event.threadID);
    }
  }
};
