/**
 * anifan.js
 * Sends fun anime GIFs: heart, cry, hug, kiss, dance, laugh, slap, wave, pat, cheer
 * Version: 1.1
 * Author: eran
 */

const gifs = {
    heart: [
        "https://media.giphy.com/media/l0HlBO7eyXzSZkJri/giphy.gif",
        "https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif",
        "https://media.giphy.com/media/xT0GqssRweIhlz209i/giphy.gif"
    ],
    cry: [
        "https://media.giphy.com/media/ROF8OQvDmxytW/giphy.gif",
        "https://media.giphy.com/media/10tIjpzIu8fe0/giphy.gif",
        "https://media.giphy.com/media/od5H3PmEG5EVq/giphy.gif"
    ],
    hug: [
        "https://media.giphy.com/media/l2QDM9Jnim1YVILXa/giphy.gif",
        "https://media.giphy.com/media/wnsgren9NtITS/giphy.gif",
        "https://media.giphy.com/media/143v0Z4767T15e/giphy.gif"
    ],
    kiss: [
        "https://media.giphy.com/media/G3va31oEEnIkM/giphy.gif",
        "https://media.giphy.com/media/FqBTvSNjNzeZG/giphy.gif",
        "https://media.giphy.com/media/zkppEMFvRX5FC/giphy.gif"
    ],
    dance: [
        "https://media.giphy.com/media/3o7aD2saalBwwftBIY/giphy.gif",
        "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif",
        "https://media.giphy.com/media/26xBuw2n9gakz1zWc/giphy.gif"
    ],
    laugh: [
        "https://media.giphy.com/media/1BdIPTJxJcr04/giphy.gif",
        "https://media.giphy.com/media/3o6ZtaO9BZHcOjmErm/giphy.gif"
    ],
    slap: [
        "https://media.giphy.com/media/Gf3AUz3eBNbTW/giphy.gif",
        "https://media.giphy.com/media/jLeyZWgtwgr2U/giphy.gif"
    ],
    wave: [
        "https://media.giphy.com/media/xT0GqeSlGSRQut4nO4/giphy.gif",
        "https://media.giphy.com/media/3o7qE1YN7aBOFPRw8E/giphy.gif"
    ],
    pat: [
        "https://media.giphy.com/media/ARSp9T7wwxNcs/giphy.gif",
        "https://media.giphy.com/media/109ltuoSQT212w/giphy.gif"
    ],
    cheer: [
        "https://media.giphy.com/media/3o6Zt481isNVuQI1l6/giphy.gif",
        "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif"
    ]
};

module.exports = {
    config: {
        name: "anifan",
        version: "1.1",
        author: "eran",
        description: "Sends fun anime GIFs",
        category: "fun",
        role: 0
    },

    onStart: async function ({ message, args, send }) {
        // Get the user command
        const command = args[0]?.toLowerCase();

        // Check if command exists
        if (!command || !gifs[command]) {
            return await send({
                body: "❌ Please provide a valid anime command:\nheart, cry, hug, kiss, dance, laugh, slap, wave, pat, cheer"
            });
        }

        // Pick a random GIF from the selected command
        const randomGif = gifs[command][Math.floor(Math.random() * gifs[command].length)];

        // Send the GIF
        await send({
            body: `✨ Here's your ${command} anime GIF!`,
            attachment: [randomGif]
        });
    }
};
