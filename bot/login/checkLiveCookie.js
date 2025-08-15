const axios = require("axios");

/**
 * Checks if a Facebook cookie is valid.
 * @param {string} cookie - Cookie string in format `c_user=123; xs=123; datr=123;`
 * @param {string} [userAgent] - Optional user agent string
 * @returns {Promise<boolean>} - True if cookie is valid, false otherwise
 */
module.exports = async function checkFacebookCookie(cookie, userAgent) {
	if (!cookie || typeof cookie !== "string" || !cookie.includes("c_user=")) {
		console.error("[checkFacebookCookie] Invalid or missing cookie.");
		return false;
	}

	try {
		const response = await axios.get("https://mbasic.facebook.com/settings", {
			headers: {
				cookie,
				"user-agent":
					userAgent ||
					"Mozilla/5.0 (Linux; Android 12; M2102J20SG) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.0.0 Mobile Safari/537.36",
				accept:
					"text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
				"accept-language": "en-US,en;q=0.9",
				"sec-ch-prefers-color-scheme": "dark",
				"sec-ch-ua":
					'"Chromium";v="112", "Microsoft Edge";v="112", "Not:A-Brand";v="99"',
				"sec-ch-ua-mobile": "?0",
				"sec-ch-ua-platform": '"Windows"',
				"sec-fetch-dest": "document",
				"sec-fetch-mode": "navigate",
				"sec-fetch-site": "none",
				"sec-fetch-user": "?1",
				"upgrade-insecure-requests": "1",
			},
			timeout: 10000, // 10 seconds timeout
		});

		const html = response.data;
		return (
			html.includes("/privacy/xcs/action/logging/") ||
			html.includes("/notifications.php?") ||
			html.includes('href="/login/save-password-interstitial')
		);
	} catch (error) {
		console.error("[checkFacebookCookie] Request failed:", error.message);
		return false;
	}
};
