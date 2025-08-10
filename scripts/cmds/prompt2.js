const axios = require("axios");

const getBaseUrls = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/exe/main/baseApiUrl.json");
  return { mj: base.data.mj, nj: base.data.nj };
};

const getNijiiProfile = async (baseUrl) => {
  const res = await axios.get(`${baseUrl}/api/nijii/random`);
  return res.data;
};

// Helper: parse option value from args, remove it from args, return the value or default
function extractOption(args, optionName, defaultValue = null) {
  const index = args.findIndex(arg => arg.toLowerCase() === optionName.toLowerCase());
  if (index !== -1 && args.length > index + 1) {
    const val = args[index + 1];
    args.splice(index, 2);
    return val;
  }
  return defaultValue;
}

module.exports = {
  config: {
    name: "prompt2",
    aliases: ["p2"],
    version: "2.1",
    author: "eran",
    category: "ai",
    guide: {
      en: "{pn} [--ar WIDTH:HEIGHT] [--niji N] [--style STYLE] [--q QUALITY] reply with an image and an optional prompt"
    },
  },

  onStart: async function ({ api, args, event }) {
    try {
      const baseUrls = await getBaseUrls();

      // Detect mode
      let mode = "mj";
      if (args[0] === "--nj") {
        mode = "nj";
        args.shift();
      } else if (args[0] === "--mj") {
        args.shift();
      }

      // Extract options
      const ar = extractOption(args, "--ar", null);        // eg "1:2"
      const niji = extractOption(args, "--niji", null);    // eg "5"
      const style = extractOption(args, "--style", null);  // eg "photorealistic"
      const q = extractOption(args, "--q", null);          // eg "2"

      const baseUrl = baseUrls[mode];

      if (event.type === "message_reply" && event.messageReply.attachments?.[0]?.type === "photo") {
        // Remaining args are the prompt text
        const promptText = args.length ? args.join(" ") : "Describe this image";

        // Build body for API call with optional params
        const body = {
          imageUrl: event.messageReply.attachments[0].url,
          prompt: promptText,
        };

        if (mode === "mj") {
          if (ar) body.ar = ar;
          if (style) body.style = style;
          if (q) body.q = q;
        } else if (mode === "nj") {
          if (ar) body.ar = ar;
          if (niji) body.niji = niji;
          if (style) body.style = style;
          if (q) body.q = q;
        }

        const [aiResponse, nijiiProfile] = await Promise.all([
          axios.post(`${baseUrl}/api/prompt`, body, {
            headers: {
              "Content-Type": "application/json",
              author: module.exports.config.author,
            }
          }),
          mode === "nj" ? getNijiiProfile(baseUrl) : null
        ]);

        const aiReply = aiResponse.data.error || aiResponse.data.response || "No response from AI.";

        if (mode === "nj" && nijiiProfile) {
          await api.sendMessage({
            body: `${aiReply}\n\n✨ Nijii Profile:\n👤 Name: ${nijiiProfile.name}\n📜 Description: ${nijiiProfile.description || "N/A"}`,
            attachment: await global.utils.getStreamFromURL(nijiiProfile.avatarUrl, "nijii-avatar.jpg")
          }, event.threadID, event.messageID);
        } else {
          await api.sendMessage(aiReply, event.threadID, event.messageID);
        }

        return api.setMessageReaction("🪽", event.messageID, () => {}, true);

      } else {
        if (mode === "nj") {
          const nijiiProfile = await getNijiiProfile(baseUrl);
          return api.sendMessage({
            body: `✨ Random Nijii Profile:\n👤 Name: ${nijiiProfile.name}\n📜 Description: ${nijiiProfile.description || "N/A"}`,
            attachment: await global.utils.getStreamFromURL(nijiiProfile.avatarUrl, "nijii-avatar.jpg")
          }, event.threadID, event.messageID);
        } else {
          return api.sendMessage("📌 Please reply to an image with a prompt for MJ mode.", event.threadID, event.messageID);
        }
      }
    } catch (error) {
      console.error("prompt2 command error:", error);
      return api.sendMessage("❌ Something went wrong while fetching data. Please try again later.", event.threadID, event.messageID);
    }
  }
};
