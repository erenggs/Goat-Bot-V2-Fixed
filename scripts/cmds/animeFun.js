/**
 * animeFun.js
 * Sends fun anime GIFs: heart, cry, hug, kiss, dance
 * Version: 1.0
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
    ]
};

module.exports = {
    config: {
        name: "animeFun",
        version: "1.0",
        author: "eran",
        description: "Sends fun anime GIFs",
        category: "fun",
        role: 0
    },

    onStart: async function ({ message, args, send }) {
        const command = args[0]?.toLowerCase();

        if (!command || !gifs[command]) {
            return await send({
                body: "Please provide a valid anime command: heart, cry, hug, kiss, dance"
            });
        }

        const randomGif = gifs[command][Math.floor(Math.random() * gifs[command].length)];

        await send({
            body: `✨ Here's your ${command} anime GIF!`,
            attachment: [randomGif]
        });
    }
};
