const axios = require("axios");

module.exports = {
  config: {
    name: "character",
    aliases: ["char", "animechar"],
    version: "1.0",
    author: "eran",
    countDown: 10,
    role: 2, // available to all users
    shortDescription: "Get info about an anime character",
    longDescription: "Fetch detailed information about a specific anime character using Kitsu API",
    category: "Anime",
  },

  run: async ({ api, event, args }) => {
    const query = args.join(" ");
    if (!query) return api.sendMessage("Please provide a character name!", event.threadID);

    try {
      const res = await axios.get(`https://kitsu.io/api/edge/characters?filter[name]=${encodeURIComponent(query)}`);
      const data = res.data.data[0];
      if (!data) return api.sendMessage("Character not found!", event.threadID);

      const name = data.attributes.name;
      const japaneseName = data.attributes.nameKanji || "N/A";
      const description = data.attributes.about ? data.attributes.about.replace(/<[^>]*>?/gm, '') : "No description available";
      const image = data.attributes.image?.original || "";

      const message = `
🧑 Character Info
Name: ${name}
Japanese Name: ${japaneseName}
Description: ${description}
      `;

      api.sendMessage({ body: message, attachment: image ? await global.utils.getStream(image) : undefined }, event.threadID);
    } catch (err) {
      console.error(err);
      api.sendMessage("Error fetching character info.", event.threadID);
    }
  }
};
