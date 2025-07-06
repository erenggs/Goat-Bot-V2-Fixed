const axios = require("axios");
const fs = require("fs-extra");
const { loadImage, createCanvas } = require("canvas");

module.exports = {
  config: {
    name: "pair2",
    countDown: 10,
    role: 0,
    shortDescription: {
      en: "Get to know your partner",
    },
    longDescription: {
      en: "Know your destiny and know who you will complete your life with",
    },
    category: "love",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ api, message, event, usersData }) {
    const pathImg = __dirname + "/assets/background.png";
    const pathAvt1 = __dirname + "/assets/any.png";
    const pathAvt2 = __dirname + "/assets/avatar.png";

    const id1 = event.senderID;
    const name1 = await usersData.getName(id1);

    const ThreadInfo = await api.getThreadInfo(event.threadID);
    const all = ThreadInfo.userInfo;

    let gender1;
    for (let c of all) {
      if (c.id == id1) gender1 = c.gender;
    }

    const botID = api.getCurrentUserID();
    let ungvien = [];

    for (let u of all) {
      if (u.id !== id1 && u.id !== botID) {
        if ((gender1 === "FEMALE" && u.gender === "MALE") ||
            (gender1 === "MALE" && u.gender === "FEMALE") ||
            (gender1 !== "FEMALE" && gender1 !== "MALE")) {
          ungvien.push(u.id);
        }
      }
    }

    if (ungvien.length === 0) {
      return message.reply("⚠️ No matching partner found in this group.");
    }

    const id2 = ungvien[Math.floor(Math.random() * ungvien.length)];
    const name2 = await usersData.getName(id2);

    const rd1 = Math.floor(Math.random() * 100) + 1;
    const cc = ["0", "-1", "99,99", "-99", "-100", "101", "0,01"];
    const djtme = [rd1, rd1, rd1, rd1, rd1, cc[Math.floor(Math.random() * cc.length)], rd1, rd1, rd1, rd1];
    const tile = djtme[Math.floor(Math.random() * djtme.length)];

    const background = "https://i.ibb.co/RBRLmRt/Pics-Art-05-14-10-47-00.jpg";

    const getAvtmot = (
      await axios.get(
        `https://graph.facebook.com/${id1}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
        { responseType: "arraybuffer" }
      )
    ).data;
    fs.writeFileSync(pathAvt1, Buffer.from(getAvtmot, "utf-8"));

    const getAvthai = (
      await axios.get(
        `https://graph.facebook.com/${id2}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
        { responseType: "arraybuffer" }
      )
    ).data;
    fs.writeFileSync(pathAvt2, Buffer.from(getAvthai, "utf-8"));

    const getBackground = (
      await axios.get(background, { responseType: "arraybuffer" })
    ).data;
    fs.writeFileSync(pathImg, Buffer.from(getBackground, "utf-8"));

    const baseImage = await loadImage(pathImg);
    const baseAvt1 = await loadImage(pathAvt1);
    const baseAvt2 = await loadImage(pathAvt2);

    const canvas = createCanvas(baseImage.width, baseImage.height);
    const ctx = canvas.getContext("2d");

    ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
    ctx.drawImage(baseAvt1, 111, 175, 330, 330);
    ctx.drawImage(baseAvt2, 1018, 173, 330, 330);

    const imageBuffer = canvas.toBuffer();
    fs.writeFileSync(pathImg, imageBuffer);

    fs.removeSync(pathAvt1);
    fs.removeSync(pathAvt2);

    return api.sendMessage({
      body: `『💗』Congratulations ${name1}『💗』\n『❤️』Your destiny brought you together with ${name2}『❤️』\n『🔗』Your link percentage is ${tile}%『🔗』`,
      mentions: [
        { tag: name2, id: id2 },
        { tag: name1, id: id1 }
      ],
      attachment: fs.createReadStream(pathImg)
    }, event.threadID, () => fs.unlinkSync(pathImg), event.messageID);
  }
};
