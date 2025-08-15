const axios = require("axios");

module.exports = {
  config: {
    name: "wallpaper",
    aliases: ["wp", "wall"],
    version: "1.0",
    author: "eran",
    countDown: 10,
    role: 0, // everyone can use
    shortDescription: "🖼️ Get a random wallpaper",
    longDescription: "Searches for a wallpaper image based on your query and sends it in the chat.",
    category: "Media",
  },

  run: async ({ api, event, args }) => {
    try {
      if (!args[0]) return api.sendMessage("❌ Please provide a keyword for the wallpaper.", event.threadID);

      const query = args.join(" ");
      // Replace with a real wallpaper API, example using Unsplash
      const url = `https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&client_id=YOUR_UNSPLASH_ACCESS_KEY`;

      const response = await axios.get(url);
      if (!response.data || !response.data.urls || !response.data.urls.full) {
        return api.sendMessage("❌ No wallpapers found for your query.", event.threadID);
      }

      const wallpaperUrl = response.data.urls.full;

      return api.sendMessage({ body: `🖼 Wallpaper for: ${query}`, attachment: await global.utils.getStream(wallpaperUrl) }, event.threadID);
    } catch (err) {
      console.error(err);
      return api.sendMessage("❌ Something went wrong while fetching the wallpaper!", event.threadID);
    }
  },
};
