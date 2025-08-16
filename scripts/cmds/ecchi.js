const axios = require("axios");

module.exports = {
    config: {
        name: "ecchi",
        aliases: ["lewd"],
        version: "2.0",
        author: "eran",
        countDown: 10,
        role: 2, // 0 = everyone
        category: "nsfw",
        description: "Sends a random NSFW/ecchi anime image with multiple categories",
        usage: "ecchi [category]\nCategories: ecchi, yuri, yaoi, trap, futa, neko, foxgirl"
    },

    run: async ({ api, event, args }) => {
        try {
            const categories = ["ero", "yuri", "yaoi", "trap", "futanari", "neko", "kitsune"];
            let category = args[0]?.toLowerCase() || "ero"; // default to "ero"

            if (!categories.includes(category)) category = "ero"; // fallback

            // Fetch image from nekos.life API
            const res = await axios.get(`https://nekos.life/api/v2/img/${category}`);
            const imageUrl = res.data.url;

            api.sendMessage({
                body: `Here’s your ${category} anime image 😏`,
                attachment: await global.utils.getStreamFromURL(imageUrl)
            }, event.threadID);

        } catch (err) {
            console.error(err);
            api.sendMessage("❌ Failed to fetch NSFW image. Try again later.", event.threadID);
        }
    }
};
