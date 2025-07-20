const axios = require('axios');

module.exports = {
	config: {
		name: "hot",
		aliases: ["spicy", "sauce"],
		version: "1.0",
		author: "eran",
		countDown: 5,
		role: 0, // Change to 2 if you want admin-only access
		shortDescription: "Send a spicy NSFW anime image",
		longDescription: "Sends a random hot anime image from waifu.pics (NSFW). Choose a category or default to 'waifu'.",
		category: "nsfw",
		guide: "{pn} [category]\nExample: {pn} blowjob"
	},

	onStart: async function ({ message, args }) {
		const category = args.join(" ").trim().toLowerCase() || "waifu";

		const validNSFW = ["waifu", "neko", "trap", "blowjob"];

		if (!validNSFW.includes(category)) {
			return message.reply(
				`🔥 Invalid category!\nAvailable NSFW categories:\n${validNSFW.join(", ")}`
			);
		}

		try {
			const res = await axios.get(`https://api.waifu.pics/nsfw/${category}`);
			const img = res?.data?.url;

			const form = {
				body: `🔥 𝙷𝙾𝚃 𝙼𝙾𝙳𝙴 - ${category.toUpperCase()}`
			};

			if (img) form.attachment = await global.utils.getStreamFromURL(img);

			message.reply(form);
		} catch (err) {
			console.error("HOT command error:", err.message);
			message.reply(`😢 Could not fetch hot content. Try again later.`);
		}
	}
};
