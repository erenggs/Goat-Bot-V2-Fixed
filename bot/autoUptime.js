const axios = require('axios');
const { config } = global.GoatBot;
const { log, getText } = global.utils;

// Clear any previous uptime timer
if (global.timeOutUptime) clearTimeout(global.timeOutUptime);

// Exit if auto uptime is disabled
if (!config.autoUptime?.enable) return;

// Determine dashboard/server port
const PORT =
  config.dashBoard?.port ||
  (!isNaN(config.serverUptime?.port) && config.serverUptime.port) ||
  3001;

// Build base URL for uptime check
let myUrl =
  config.autoUptime.url ||
  `https://${
    process.env.REPL_OWNER
      ? `${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`
      : process.env.API_SERVER_EXTERNAL === 'https://api.glitch.com'
      ? `${process.env.PROJECT_DOMAIN}.glitch.me`
      : `localhost:${PORT}`
  }`;

// If localhost, use HTTP instead of HTTPS
if (myUrl.includes('localhost')) {
  myUrl = myUrl.replace(/^https/, 'http');
}

myUrl += '/uptime';

// Status tracking
let status = 'ok';

// Auto uptime check function
const autoUptime = async () => {
  try {
    await axios.get(myUrl);

    if (status !== 'ok') {
      status = 'ok';
      log.info('UPTIME', 'Bot is online');
      // Custom notification here
    }
  } catch (error) {
    const errData = error.response?.data || error.message || error;

    if (status === 'failed') return;
    status = 'failed';

    if (errData.statusAccountBot === "can't login") {
      log.err('UPTIME', "Can't login account bot");
      // Custom notification here
    } else if (errData.statusAccountBot === 'block spam') {
      log.err('UPTIME', 'Your account is blocked');
      // Custom notification here
    } else {
      log.err('UPTIME', `Uptime check failed: ${errData}`);
    }
  }
};

// Start initial check after given interval
setTimeout(() => {
  autoUptime();
  global.timeOutUptime = setInterval(
    autoUptime,
    (config.autoUptime.timeInterval || 180) * 1000
  );
}, (config.autoUptime.timeInterval || 180) * 1000);

log.info(
  'AUTO UPTIME',
  getText('autoUptime', 'autoUptimeTurnedOn', myUrl)
);
