const os = require("os");

module.exports = {
  config: {
    name: "ping",
    aliases: ["latency", "status"],
    version: "2.0",
    author: "eran",
    countDown: 10,
    role: 2,  // 2 = admin only
    shortDescription: "🏓⚡ Check bot latency, uptime & system status",
    longDescription: "Measures the bot's response time (ping) 🏓, uptime ⏱️, CPU usage 💻, and RAM usage 🧠 with emojis.",
    category: "Utility",
  },

  run: async ({ api, event }) => {
    try {
      const start = Date.now();
      const uptime = process.uptime(); // in seconds

      // Send temporary message to calculate latency
      await api.sendMessage("🏓 Pinging... 🔄", event.threadID);

      const end = Date.now();
      const ping = end - start;

      // Format uptime
      const hours = Math.floor(uptime / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = Math.floor(uptime % 60);

      // CPU & RAM usage
      const cpuUsage = os.loadavg()[0].toFixed(2); // 1-min load average
      const totalMem = (os.totalmem() / 1024 / 1024).toFixed(0); // MB
      const freeMem = (os.freemem() / 1024 / 1024).toFixed(0); // MB
      const usedMem = totalMem - freeMem;

      // Final message with emojis
      const message = `
🏓 Pong! 🎯
💨 Latency: ${ping}ms
⏱️ Uptime: ${hours}h ${minutes}m ${seconds}s
💻 CPU Load: ${cpuUsage}%
🧠 RAM: ${usedMem}MB / ${totalMem}MB
🌐 Status: Online ✅
      `;

      api.sendMessage(message.trim(), event.threadID);

    } catch (error) {
      console.error("Ping command error:", error);
      api.sendMessage("⚠️ Oops! Failed to calculate ping ❌", event.threadID);
    }
  },
};
