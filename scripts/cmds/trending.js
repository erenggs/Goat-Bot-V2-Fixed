const axios = require("axios");

module.exports = {
    config: {
        name: "trending",
        aliases: ["trend", "hot", "popular"],
        version: "1.0",
        author: "eran",
        countDown: 10,
        role: 2, // everyone can use
        shortDescription: "🔥 Shows trending media content",
        longDescription: "Fetches trending videos, music, or posts from platforms like YouTube, TikTok, or social media via API",
        category: "media",
    },

    run: async ({ api, event, args, getText }) => {
        try {
            // Example API: YouTube trending videos via RapidAPI (replace with your API key)
            const options = {
                method: 'GET',
                url: 'https://youtube-trending-api.p.rapidapi.com/trending',
                headers: {
                    'X-RapidAPI-Key': 'YOUR_RAPIDAPI_KEY',
                    'X-RapidAPI-Host': 'youtube-trending-api.p.rapidapi.com'
                },
                params: { country: 'US', limit: 5 } // fetch top 5 trending
            };

            const response = await axios.request(options);
            const videos = response.data;

            if (!videos || videos.length === 0) {
                return api.sendMessage("❌ No trending content found.", event.threadID);
            }

            let message = "🔥 Top Trending Videos:\n\n";
            videos.forEach((video, index) => {
                message += `${index + 1}. ${video.title}\n🎬 Link: ${video.url}\n\n`;
            });

            return api.sendMessage(message, event.threadID);
        } catch (error) {
            console.error(error);
            return api.sendMessage("❌ Failed to fetch trending content.", event.threadID);
        }
    }
};
