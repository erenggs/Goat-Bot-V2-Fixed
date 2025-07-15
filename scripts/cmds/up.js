const os = require("os");
const { execSync } = require("child_process");

function formatBytes(bytes) {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  if (bytes === 0) return "0 Bytes";
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return (bytes / Math.pow(1024, i)).toFixed(2) + " " + sizes[i];
}

module.exports = {
  config: {
    name: "uptime",
    aliases: ["up", "upt"],
    version: "1.2",
    author: "eran_hossain",
    shortDescription: "Show bot status & uptime",
    longDescription: "Displays uptime, system specs and resource usage.",
    category: "system",
    guide: "{pn}"
  },

  onStart: async function ({ message, threadsData, usersData }) {
    try {
      const uptimeSec = process.uptime();
      const hours = Math.floor(uptimeSec / 3600);
      const minutes = Math.floor((uptimeSec % 3600) / 60);
      const seconds = Math.floor(uptimeSec % 60);

      const uptime = `${hours}Hrs ${minutes}Min ${seconds}Sec`;

      const threads = await threadsData.getAll();
      const groups = threads.filter(t => t.threadInfo?.isGroup).length;
      const users = (await usersData.getAll()).length;

      const totalMem = os.totalmem();
      const usedMem = totalMem - os.freemem();
      const memUsage = (usedMem / totalMem) * 100;

      const memBar = "█".repeat(Math.round(memUsage / 10)) + "▒".repeat(10 - Math.round(memUsage / 10));
      const ramBar = "█".repeat(Math.round(usedMem / totalMem * 10)) + "▒".repeat(10 - Math.round(usedMem / totalMem * 10));

      let disk = {
        used: 0,
        total: 1,
        bar: "▒▒▒▒▒▒▒▒▒▒"
      };

      try {
        const df = execSync("df -k /").toString().split("\n")[1].split(/\s+/);
        const used = parseInt(df[2]) * 1024;
        const total = parseInt(df[1]) * 1024;
        const percent = Math.round((used / total) * 100);
        const bar = "█".repeat(Math.floor(percent / 10)) + "▒".repeat(10 - Math.floor(percent / 10));
        disk = {
          used,
          total,
          bar
        };
      } catch (e) {}

      const msg =
`⏳ | Bot Running: ${uptime}
📊 | Groups: ${groups}
👪 | Users: ${users}
📡 | OS: ${os.type().toLowerCase()} ${os.release()}
🖥️ | Model: ${os.cpus()[0]?.model || "Unknown Processor"}
🛡 | Cores: ${os.cpus().length}
🗄 | Architecture: ${os.arch()}
📀 | Disk Information:
        [${disk.bar}]
        Usage: ${formatBytes(disk.used)}
        Total: ${formatBytes(disk.total)}
💾 | Memory Information:
        [${memBar}]
        Usage: ${formatBytes(usedMem)}
        Total: ${formatBytes(totalMem)}
🗃 | Ram Information:
        [${ramBar}]
        Usage: ${(usedMem / 1024 / 1024 / 1024).toFixed(2)} GB
        Total: ${(totalMem / 1024 / 1024 / 1024).toFixed(2)} GB`;

      message.reply(msg);
    } catch (err) {
      console.error(err);
      message.reply("❌ | Uptime command failed.");
    }
  }
};
