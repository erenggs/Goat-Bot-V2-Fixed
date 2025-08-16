const axios = require("axios");

module.exports = {
    config: {
        name: "meow",
        aliases: ["kitty"],
        version: "1.1",
        author: "eran_hossain",
        countDown: 10,
        role: 0,
        shortDescription: "Sends a random cat image, gif, fact, or sound",
        longDescription: "Fetches a cute cat image/gif, fun cat fact, and optional meow sound from APIs",
        category: "fun",
        usage: "{pn}"
    },

    run: async ({ message, args, api }) => {
        try {
            // Random choice: image, gif, fact, or sound
            const choice = Math.floor(Math.random() * 4); // 0=image, 1=gif, 2=fact, 3=sound

            if (choice === 0) {
                // Cat image
                const response = await axios.get("https://api.thecatapi.com/v1/images/search");
                const imageUrl = response.data[0].url;

                api.sendMessage({
                    body: "😺 Meow! Here's a cute cat image for you!",
                    attachment: await global.Utils.getStreamFromURL(imageUrl)
                }, message.threadID, message.messageID);

            } else if (choice === 1) {
                // Cat gif
                const response = await axios.get("https://api.giphy.com/v1/gifs/random", {
                    params: {
                        api_key: "dc6zaTOxFJmzC", // Giphy public API
                        tag: "cat",
                        rating: "pg"
                    }
                });
                const gifUrl = response.data.data.images.original.url;

                api.sendMessage({
                    body: "😸 Meow! Here's a funny cat gif!",
                    attachment: await global.Utils.getStreamFromURL(gifUrl)
                }, message.threadID, message.messageID);

            } else if (choice === 2) {
                // Cat fact
                const response = await axios.get("https://meowfacts.herokuapp.com/");
                const fact = response.data.data[0];

                api.sendMessage(`🐱 Cat Fact: ${fact}`, message.threadID, message.messageID);

            } else {
                // Meow sound
                const soundUrl = "https://www.soundjay.com/cat/cat-meow-1.mp3"; // Example sound

                api.sendMessage({
                    body: "🎵 Meow sound!",
                    attachment: await global.Utils.getStreamFromURL(soundUrl)
                }, message.threadID, message.messageID);
            }

        } catch (error) {
            console.error(error);
            api.sendMessage("❌ Sorry, something went wrong fetching cat content!", message.threadID, message.messageID);
        }
    }
};
