module.exports = {
  config: {
    name: "ping", // Command name
    description: "Check if the bot is alive",
    usage: "!ping"
  },
  run: async ({ api, threadID }) => {
    const start = Date.now(); // Start time
    api.sendMessage("🏓 Pinging...", threadID, () => {
      const end = Date.now(); // End time
      const latency = end - start;
      api.sendMessage(`✅ Pong! Latency: ${latency}ms`, threadID);
    });
  }
};
