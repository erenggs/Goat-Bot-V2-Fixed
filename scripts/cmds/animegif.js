const axios = require("axios");

// Replace with your Google API Key and Custom Search Engine ID
const GOOGLE_API_KEY = "YOUR_GOOGLE_API_KEY";
const GOOGLE_CSE_ID = "YOUR_CUSTOM_SEARCH_ENGINE_ID";

module.exports = {
  config: {
    name: "animegif",
    version: "2.2",
    author: "eran",
    countDown: 5,
    role: 0,
    shortDescription: "Send anime action GIFs",
    longDescription:
      "Sends random anime action GIFs like hug, kiss, slap, pat, etc. from multiple APIs including Google GIF search.",
    category: "anime",
    guide:
      "{p}animegif [action]\n" +
      "Available: hug, kiss, pat, slap, wave, smile, cry, blush, wink, highfive, punch, dance, cuddle, handhold\n" +
      "Example: {p}animegif hug"
  },

  onStart: async function ({ api, event, args }) {
    const actions = [
      "hug", "kiss", "pat", "slap", "wave",
      "smile", "cry", "blush", "wink", "highfive",
      "punch", "dance", "cuddle", "handhold"
    ];

    const inputAction = args[0]?.toLowerCase();
    const chosenAction = actions.includes(inputAction)
      ? inputAction
      : actions[Math.floor(Math.random() * actions.length)];

    const sources = [
      {
        name: "Waifu.pics",
        url: `https://api.waifu.pics/sfw/${chosenAction}`,
        getImage: (res) => res.data?.url
      },
      {
        name: "Nekos.dev",
        url: `https://nekos.best/api/v2/${chosenAction}`,
        getImage: (res) => res.data?.results?.[0]?.url
      },
      {
        name: "OtakuGIFs",
        url: `https://otakugifs-api.vercel.app/gif?reaction=${chosenAction}`,
        getImage: (res) => res.data?.url
      },
      {
        name: "Google GIF Search",
        url: `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_CSE_ID}&searchType=image&fileType=gif&imgType=animated&q=anime+${chosenAction}&safe=active&num=10`,
        getImage: (res) => {
          const items = res.data?.items;
          if (!items || items.length === 0) return null;
          // Pick a random GIF from Google results
          const randomIndex = Math.floor(Math.random() * items.length);
          return items[randomIndex]?.link || null;
        }
      }
    ];

    let imageUrl = null;
    let sourceName = "";

    for (const source of sources) {
      try {
        const res = await axios.get(source.url, { timeout: 6000 });
        imageUrl = source.getImage(res);
        if (imageUrl && imageUrl.endsWith(".gif")) {
          sourceName = source.name;
          break;
        }
      } catch (err) {
        console.warn(`⚠️ Failed from ${source.name}:`, err?.message || err);
      }
    }

    if (!imageUrl) {
      return api.sendMessage(
        "❌ All anime GIF APIs failed to respond correctly.\nPlease try again later or use a different action.",
        event.threadID,
        event.messageID
      );
    }

    try {
      return api.sendMessage({
        body: `🎬 Anime action: ${chosenAction}\n🌐 Source: ${sourceName}`,
        attachment: await global.utils.getStreamFromURL(imageUrl)
      }, event.threadID, event.messageID);
    } catch (streamErr) {
      console.error("❌ Error loading GIF stream:", streamErr);
      return api.sendMessage(
        "❌ Failed to load the anime GIF image. Try again shortly.",
        event.threadID,
        event.messageID
      );
    }
  }
};
