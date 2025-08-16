const axios = require("axios");

module.exports = {
    config: {
        name: "hentai",
        aliases: ["hentaipic", "hentaimg", "hent", "ecchi", "yuri", "yaoi", "trap", "futa", "neko", "foxgirl"],
        version: "2.0",
        author: "eran",
        countDown: 10,
        role: 2, // 0 = everyone (change to 2 for admin only)
        category: "nsfw",
        description: "Sends a random NSFW anime image with multiple categories",
        usage: "hentai [category]\nCategories: hentai, ecchi, yuri, yaoi, trap, futa, neko, foxgirl"
    },

    run: async ({ api, event, args }) => {
        try {
            const categories = ["hentai", "ero", "yuri", "yaoi", "trap", "futanari", "neko", "kitsune"];
            let category = args[0]?.toLowerCase() || "hentai"; // default to "hentai"

            if (!categories.includes(category)) category = "hentai"; // fallback

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
