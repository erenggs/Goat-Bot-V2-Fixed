const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "midjourney",
    aliases: ["mj"],
    version: "1.0",
    author: "eran",
    countDown: 10,
    role: 0,
    shortDescription: "Generate image with Midjourney style",
    longDescription: "AI image generator using Midjourney v4 with U1–U4 & V1–V4 features",
    category: "ai-image",
    guide: "{pn} <prompt>\nExample: {pn} A boy with wings"
  },

  onStart: async function ({ args, message, event, api }) {
    const prompt = args.join(" ");
    if (!prompt) return message.reply("❌ Please provide a prompt.\nExample: midjourney A lion with fire wings");

    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    try {
      const res = await axios.get(`https://api.oculux.xyz/api/mj-4?prompt=${encodeURIComponent(prompt)}`);
      const { output, actions, taskId } = res.data;

      const filePath = path.join(__dirname, "cache", `${taskId}.jpg`);
      const image = await axios.get(output, { responseType: "arraybuffer" });
      fs.writeFileSync(filePath, Buffer.from(image.data, "binary"));

      const actionButtons = actions
        .filter(btn => btn.label) // skip blank label
        .map(action => `${action.label}`).join(" | ");

      message.reply({
        body: `🖼️ Prompt: ${prompt}\n🆔 TaskID: ${taskId}\n\n🧩 Choose:\n[ ${actionButtons} ]\n\n📌 Reply with any of the above (U1–U4 or V1–V4)`,
        attachment: fs.createReadStream(filePath)
      }, async (err, info) => {
        if (err) return;

        global.GoatBot.onReply.set(info.messageID, {
          commandName: "midjourney",
          author: event.senderID,
          taskId,
          actions
        });

        fs.unlinkSync(filePath);
        api.setMessageReaction("✅", event.messageID, () => {}, true);
      });

    } catch (err) {
      console.error("MJ Error:", err.message);
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      message.reply("❌ Failed to generate image. Try again later.");
    }
  },

  onReply: async function ({ event, message, Reply }) {
    const { taskId, actions, author } = Reply;

    if (event.senderID !== author)
      return message.reply("⚠️ Only the user who requested the image can reply.");

    const choice = event.body.toUpperCase();
    const validLabels = actions.map(btn => btn.label);
    if (!validLabels.includes(choice))
      return message.reply(`❌ Invalid option. Choose one of: ${validLabels.join(", ")}`);

    const selected = actions.find(btn => btn.label === choice);
    if (!selected) return message.reply("❌ Could not find the action URL.");

    try {
      const res = await axios.get(selected.url);
      const imgUrl = res.data.output;
      const img = await axios.get(imgUrl, { responseType: "arraybuffer" });
      const filePath = path.join(__dirname, "cache", `${Date.now()}_mj.jpg`);
      fs.writeFileSync(filePath, Buffer.from(img.data, "binary"));

      message.reply({ attachment: fs.createReadStream(filePath) }, () => {
        fs.unlinkSync(filePath);
      });
    } catch (err) {
      console.error("MJ U/V Error:", err.message);
      message.reply("❌ Failed to fetch variation or upscale image.");
    }
  }
};
