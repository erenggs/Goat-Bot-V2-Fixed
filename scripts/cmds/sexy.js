const axios = require('axios');

module.exports = {
	config: {
		name: "sexy",
		aliases: ["ns", "hen", "lewd"],
		version: "1.0",
		author: "eran",
		countDown: 5,
		role: 0, // Consider increasing this if you want to restrict usage
		shortDescription: "Send a random NSFW anime image",
		longDescription: "Sends a random NSFW image from waifu.pics. Choose a category or let it default.",
		category: "nsfw",
		guide: "{pn} [category]\nExample: {pn} waifu"
	},

	onStart: async function ({ message, args }) {
		const category = args.join(" ").trim().toLowerCase() || "waifu";

		// List of valid NSFW categories from waifu.pics
		const validNSFW = ["waifu", "neko", "trap", "blowjob"];

		if (!validNSFW.includes(category)) {
			return message.reply(
				`🔞 Invalid NSFW category!\nAvailable categories:\n${validNSFW.join(", ")}`
			);
		}

		try {
			const res = await axios.get(`https://api.waifu.pics/nsfw/${category}`);
			const img = res?.data?.url;

			const form = {
				body: `🔞 𝚂𝙴𝚇𝚈 𝚃𝙸𝙼𝙴 - ${category.toUpperCase()}`
			};

			if (img)
				form.attachment = await global.utils.getStreamFromURL(img);

			message.reply(form);
		} catch (err) {
			console.error("NSFW API Error:", err.message);
			message.reply(`😢 Could not load image. Try again later.`);
		}
	}
};
