const os = require("os");
const { execSync } = require("child_process");

function formatBytes(bytes) {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  if (bytes === 0) return "0 Bytes";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes / Math.pow(1024, i)).toFixed(2) + " " + sizes[i];
}

function getSystemType() {
  const hostname = os.hostname().toLowerCase();
  const platform = os.platform().toUpperCase();
  const lang = process.env.LANG?.toLowerCase() || "";
  if (hostname.includes("jp") || lang.includes("jp") || lang.includes("ja") || platform.includes("JPN")) {
    return "🇯🇵 JAPAN-TYPE SYSTEM";
  }
  return `🌐 ${platform} SYSTEM`;
}

module.exports = {
  config: {
    name: "up",
    aliases: ["uptime", "status", "sys"],
    version: "5.0.0",
    author: "eran",
    shortDescription: "💻 World’s strongest system monitor",
    longDescription: "Elite uptime, RAM, CPU, and disk stats with animated bars and perfect alignment.",
    category: "system",
    guide: "{pn} — Display premium system monitor"
  },

  onStart: async function ({ message, threadsData, usersData }) {
    try {
      const uptimeSec = process.uptime();
      const hours = Math.floor(uptimeSec / 3600);
      const minutes = Math.floor((uptimeSec % 3600) / 60);
      const seconds = Math.floor(uptimeSec % 60);
      const uptime = `${hours}h ${minutes}m ${seconds}s`;

      const threads = await threadsData.getAll();
      const groups = threads.filter(t => t.threadInfo?.isGroup).length;
      const users = (await usersData.getAll()).length;

      const totalMem = os.totalmem();
      const usedMem = totalMem - os.freemem();
      const memUsage = (usedMem / totalMem) * 100;

      const memBar = "🟥".repeat(Math.round(memUsage / 10)) + "⬛".repeat(10 - Math.round(memUsage / 10));
      const ramBar = "🟩".repeat(Math.round(usedMem / totalMem * 10)) + "⬜".repeat(10 - Math.round(usedMem / totalMem * 10));

      let disk = {
        used: 0,
        total: 1,
        bar: "⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜"
      };

      try {
        const df = execSync("df -k /").toString().split("\n")[1].split(/\s+/);
        const used = parseInt(df[2]) * 1024;
        const total = parseInt(df[1]) * 1024;
        const percent = Math.round((used / total) * 100);
        const bar = "🟨".repeat(Math.floor(percent / 10)) + "⬛".repeat(10 - Math.floor(percent / 10));
        disk = { used, total, bar };
      } catch (e) {}

      const msg =
`💠⚡ 𝗣𝗢𝗪𝗘𝗥𝗙𝗨𝗟 𝗦𝗬𝗦𝗧𝗘𝗠 𝗠𝗢𝗡𝗜𝗧𝗢𝗥 ⚡💠

🕒 𝗨𝗣𝗧𝗜𝗠𝗘       : ${uptime}
👤 𝗧𝗢𝗧𝗔𝗟 𝗨𝗦𝗘𝗥𝗦   : ${users}
💬 𝗚𝗥𝗢𝗨𝗣 𝗧𝗛𝗥𝗘𝗔𝗗𝗦 : ${groups}

💻 𝗛𝗔𝗥𝗗𝗪𝗔𝗥𝗘 𝗜𝗡𝗙𝗢
🧠 CPU           : ${os.cpus()[0]?.model || "Unknown"}
📊 CORES         : ${os.cpus().length}
🖥️ OS            : ${os.type()} ${os.release()}
📐 ARCH          : ${os.arch()}
📡 TYPE          : ${getSystemType()}

💾 𝗗𝗜𝗦𝗞 𝗦𝗧𝗔𝗧𝗨𝗦
${disk.bar}
📂 USED          : ${formatBytes(disk.used)}
📦 TOTAL         : ${formatBytes(disk.total)}

🧠 𝗠𝗘𝗠𝗢𝗥𝗬 𝗟𝗢𝗔𝗗
${memBar}
🟥 USED          : ${formatBytes(usedMem)}
🟦 AVAILABLE     : ${formatBytes(totalMem - usedMem)}

📊 𝗥𝗔𝗠 𝗢𝗩𝗘𝗥𝗩𝗜𝗘𝗪
${ramBar}
🟩 ${(usedMem / 1024 / 1024 / 1024).toFixed(2)} GB / ${(totalMem / 1024 / 1024 / 1024).toFixed(2)} GB

✅ 𝗦𝗧𝗔𝗧𝗨𝗦: 𝗔𝗟𝗟 𝗚𝗢𝗢𝗗 💎 | 𝗦𝗣𝗘𝗘𝗗: 𝗢𝗩𝗘𝗥𝗗𝗥𝗜𝗩𝗘  | 𝗠𝗢𝗗𝗘: 𝗘𝗟𝗜𝗧𝗘 🖥️`;

      message.reply(msg);
    } catch (err) {
      console.error("System Monitor Error:", err);
      message.reply("❌ Critical error — Unable to fetch system performance.");
    }
  }
};
