const os = require("os");
const { execSync } = require("child_process");

function getDeviceType() {
  const hostname = os.hostname().toLowerCase();
  const arch = os.arch().toLowerCase();
  const platform = os.platform().toLowerCase();

  if (hostname.includes("pc") || hostname.includes("desktop") || platform === "win32") {
    return "🖥️ Desktop Sistema";
  } else if (hostname.includes("laptop") || hostname.includes("notebook")) {
    return "💻 Laptop Device";
  } else if (arch.includes("arm") || platform === "android") {
    return "📱 Mobile/ARM Device";
  } else {
    return "🔧 Unknown Device";
  }
}

function formatBytes(bytes) {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  if (bytes === 0) return "0 Bytes";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes / Math.pow(1024, i)).toFixed(2) + " " + sizes[i];
}

function getRunningServices() {
  try {
    const result = execSync("systemctl list-units --type=service --state=running --no-pager", { encoding: "utf8" });
    const lines = result.split("\n");
    const services = lines
      .filter(line => line.trim().endsWith("running"))
      .map(line => "🔹 " + line.split(" ")[0])
      .slice(0, 5);
    return services.length ? services.join("\n") : "❗ No active services found.";
  } catch {
    return "⚠️ Service check not supported on this OS.";
  }
}

function getPingStyle(ping) {
  if (ping <= 50) return "🟢 **Ultra Fast** ⚡ (Excellent)";
  if (ping <= 120) return "🟡 **Fast** 🚀 (Good)";
  if (ping <= 250) return "🟠 **Moderate** 🔧 (Usable)";
  if (ping <= 400) return "🔴 **Slow** 🐌 (Laggy)";
  return "⚫ **Very Slow** 💤 (Unstable)";
}

module.exports = {
  config: {
    name: "ping",
    aliases: ["latency", "speed", "pong"],
    version: "4.5.0",
    author: "⚡ eran",
    shortDescription: "🌐 Stylish system ping monitor",
    longDescription: "Check your device's latency, uptime, CPU, memory, services, and platform — styled with love by Eran.",
    category: "system",
    guide: "{pn} — Get full diagnostic & ping style report"
  },

  onStart: async function ({ message }) {
    const start = Date.now();

    message.reply("🧪 Measuring latency and system health...").then((info) => {
      const ping = Date.now() - start;
      const uptimeSec = os.uptime();
      const uptimeH = Math.floor(uptimeSec / 3600);
      const uptimeM = Math.floor((uptimeSec % 3600) / 60);
      const uptimeS = Math.floor(uptimeSec % 60);
      const cpu = os.cpus()[0]?.model || "Unavailable";
      const cores = os.cpus().length;
      const platform = os.platform().toUpperCase();
      const deviceType = getDeviceType();
      const nodeVersion = process.version;
      const totalMem = os.totalmem();
      const usedMem = totalMem - os.freemem();
      const runningServices = getRunningServices();

      const status = 
`🎨🧠 𝗨𝗡𝗜𝗤𝗨𝗘 𝗣𝗜𝗡𝗚 & 𝗦𝗬𝗦𝗧𝗘𝗠 𝗥𝗘𝗣𝗢𝗥𝗧 — 👑 𝗘𝗥𝗔𝗡

🕒 𝗨𝗽𝘁𝗶𝗺𝗲        : ${uptimeH}h ${uptimeM}m ${uptimeS}s
⚡ 𝗟𝗮𝘁𝗲𝗻𝗰𝘆        : ${ping}ms
🚦 𝗥𝗮𝘁𝗲𝗱 𝗮𝘀      : ${getPingStyle(ping)}

🧠 𝗖𝗣𝗨             : ${cpu}
🔢 𝗖𝗼𝗿𝗲𝘀          : ${cores}
💾 𝗠𝗲𝗺𝗼𝗿𝘆         : ${formatBytes(usedMem)} / ${formatBytes(totalMem)}

💽 𝗣𝗹𝗮𝘁𝗳𝗼𝗿𝗺       : ${platform}
🏷️ 𝗛𝗼𝘀𝘁𝗻𝗮𝗺𝗲       : eran
📱 𝗗𝗲𝘃𝗶𝗰𝗲 𝗧𝘆𝗽𝗲    : ${deviceType}
🟪 𝗡𝗼𝗱𝗲.𝗷𝘀        : ${nodeVersion}

🔧 𝗔𝗰𝘁𝗶𝘃𝗲 𝗦𝗲𝗿𝘃𝗶𝗰𝗲𝘀:
${runningServices}

✅ 𝗦𝗧𝗔𝗧𝗨𝗦: ✅ ONLINE | 📡 LIVE MONITORING | 🧠 POWERED BY ⚡ ERAN`;

      message.edit(info.messageID, status);
    });
  }
};
