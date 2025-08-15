const { log } = global.utils;

module.exports = async function ({
	api,
	threadModel,
	userModel,
	dashBoardModel,
	globalModel,
	threadsData,
	usersData,
	dashBoardData,
	globalData,
	getText
}) {
	// This runs once every time the bot starts up (after login and DB load)

	// Function to refresh fb_dtsg token
	const refreshToken = async () => {
		if (typeof api.refreshFb_dtsg !== 'function') {
			return log.error('refreshFb_dtsg', 'api.refreshFb_dtsg is not available');
		}

		try {
			await api.refreshFb_dtsg();
			log.success('refreshFb_dtsg', getText('custom', 'refreshedFb_dtsg'));
		} catch (err) {
			log.error('refreshFb_dtsg', getText('custom', 'refreshedFb_dtsgError'), err.message || err);
		}
	};

	// Run every 48 hours (1000ms * 60s * 60m * 48h)
	setInterval(refreshToken, 1000 * 60 * 60 * 48);

	// Optionally, run once immediately on startup
	refreshToken();
};
