const axios = require("axios");

module.exports = {
  config: {
    name: "deepai",
    aliases: ["deep", "deepimage", "aiimg"],
    version: "1.0",
    author: "eran",
    countDown: 10,
    role: 0,
    category: "image",
    description: "Generate an AI image using DeepAI",
    usage: "{pn}deepai [prompt]"
  },

  run: async function ({ message, args, api, event }) {
    try {
      if (!args.join(" ")) {
        return api.sendMessage("Please provide a prompt to generate an image.", event.threadID);
      }

      const prompt = args.join(" ");

      const response = await axios.post(
        "https://api.deepai.org/api/text2img",
        { text: prompt },
        { headers: { "Api-Key": "YOUR_DEEPAI_API_KEY" } }
      );

      const imageUrl = response.data.output_url;
      if (!imageUrl) {
        return api.sendMessage("Failed to generate image. Try again later.", event.threadID);
      }

      api.sendMessage(
        { body: `Here is your AI image for:\n${prompt}`, attachment: await require("axios")({ url: imageUrl, responseType: "stream" }).then(r => r.data) },
        event.threadID
      );

    } catch (err) {
      console.error(err);
      api.sendMessage("Error generating image. Please check the prompt or try again later.", event.threadID);
    }
  }
};
