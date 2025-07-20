// instaVid.js

module.exports = {
  config: {
    name: "instaVid",
    version: "1.0.0",
    description: "Fetch random or trending Instagram-style videos",
    usage: "[reels | story | post]",
    author: "YourName"
  },

  run: async function ({ args, api, event }) {
    const category = args[0] || "reels";

    const videoData = await fetchInstaVideo(category);
    if (!videoData) return api.sendMessage("❌ No video found!", event.threadID);

    api.sendMessage({
      body: `🎥 Here's a ${category} for you!`,
      attachment: videoData.stream
    }, event.threadID);
  }
};

// Simulated video fetcher
async function fetchInstaVideo(type) {
  const mockVideos = {
    reels: "https://example.com/reel.mp4",
    story: "https://example.com/story.mp4",
    post: "https://example.com/post.mp4"
  };

  const url = mockVideos[type];
  const res = await require("axios").get(url, { responseType: "stream" });
  return { stream: res.data };
}
