const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

module.exports = {
  config: {
    name: "relationship",
    version: "1.0",
    author: "eran",
    countDown: 5,
    role: 0,
    shortDescription: "🔗 Random relationship between 2 people",
    longDescription: "Generate a random relationship type between two users",
    category: "love",
    guide: "{pn}"
  },

  onStart: async function ({ api, event, usersData }) {
    const threadInfo = await api.getThreadInfo(event.threadID);
    const members = threadInfo.participantIDs.filter(id => id !== api.getCurrentUserID());

    if (members.length < 2)
      return api.sendMessage("❗ Need at least 2 members in the group to generate a relationship.", event.threadID);

    // Pick 2 random people
    const shuffled = members.sort(() => Math.random() - 0.5);
    const [id1, id2] = shuffled;

    const user1 = await usersData.get(id1);
    const user2 = await usersData.get(id2);

    const name1 = user1.name;
    const name2 = user2.name;

    const relationships = [
      "💘 Lovers", "💞 Soulmates", "🧠 Best Friends", "😈 Enemies", "👀 Secret Admirers",
      "🎭 Frenemies", "🌈 Rainbow Buddies", "🔥 Hot Couple", "💍 Engaged", "🚫 Blocked Each Other",
      "💼 Co-workers", "🏠 Roommates", "🍼 Parent & Child (somehow!)", "📱 Online Only",
      "🕵️‍♂️ Spies", "🥷 Ninja Partners", "⚔️ Rivals", "👻 Ghosted", "🎮 Gaming Duo"
    ];

    const relationship = relationships[Math.floor(Math.random() * relationships.length)];

    const avatar1 = `https://graph.facebook.com/${id1}/picture?width=512&height=512`;
    const avatar2 = `https://graph.facebook.com/${id2}/picture?width=512&height=512`;
    const bg = await loadImage("https://i.imgur.com/ZT7EK2r.jpg"); // Replace with your own image if needed

    const [img1, img2] = await Promise.all([loadImage(avatar1), loadImage(avatar2)]);

    const canvas = createCanvas(800, 500);
    const ctx = canvas.getContext("2d");

    // Draw background
    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

    // Draw circular profile images
    ctx.save();
    ctx.beginPath();
    ctx.arc(200, 250, 100, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(img1, 100, 150, 200, 200);
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.arc(600, 250, 100, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(img2, 500, 150, 200, 200);
    ctx.restore();

    // Write relationship text
    ctx.font = "30px Arial";
    ctx.fillStyle = "#ff4081";
    ctx.textAlign = "center";
    ctx.fillText(`${name1} 🤝 ${name2}`, 400, 460);
    ctx.fillText(`Relationship: ${relationship}`, 400, 490);

    const filePath = path.join(__dirname, "cache", `relationship-${event.senderID}.png`);
    fs.writeFileSync(filePath, canvas.toBuffer("image/png"));

    api.sendMessage({
      body: `🔗 Relationship Detected 🔍\n${name1} 🤝 ${name2}\n💬 ${relationship}`,
      attachment: fs.createReadStream(filePath)
    }, event.threadID, () => fs.unlinkSync(filePath));
  FanFanananan
