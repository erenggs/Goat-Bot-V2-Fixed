const login = require("fca-unofficial"); // Facebook Chat API (unofficial)
const fs = require("fs");
const path = require("path");

// Load configuration from config.json
const config = require("./config.json");

// Load Facebook session data (AppState)
let appState;
try {
  appState = JSON.parse(fs.readFileSync("appstate.json", "utf8"));
} catch (err) {
  console.error("❌ appstate.json file is missing or invalid!");
  process.exit(1); // Stop the bot if cookie file is not found
}

// Global object for bot access
global.GoatBot = {
  config,                           // Load config
  commands: new Map(),              // Store all commands here
  events: new Map(),                // Store event handlers (like join/leave)
  api: null,                        // Will store Facebook API object
  adminBot: config.ADMINBOT || []   // Admin UID list
};

// Load command modules from /modules/commands
const commandDir = path.join(__dirname, "modules", "commands");
fs.readdirSync(commandDir).forEach((file) => {
  if (file.endsWith(".js")) {
    const command = require(path.join(commandDir, file));
    GoatBot.commands.set(command.config.name, command);
  }
});

// Optional: Load event handlers from /modules/events
const eventsDir = path.join(__dirname, "modules", "events");
if (fs.existsSync(eventsDir)) {
  fs.readdirSync(eventsDir).forEach((file) => {
    if (file.endsWith(".js")) {
      const event = require(path.join(eventsDir, file));
      GoatBot.events.set(event.config.name, event);
    }
  });
}

// Login to Facebook using appState (cookie session)
login({ appState }, async (err, api) => {
  if (err) {
    console.error("❌ Facebook login failed:", err);
    return;
  }

  console.log(`✅ Bot (${GoatBot.config.BOTNAME}) started successfully!`);
  GoatBot.api = api;

  // Set bot behavior options
  api.setOptions({
    listenEvents: true,       // Enable event listening (e.g., join/leave)
    selfListen: false,        // Don't respond to own messages
    forceLogin: true,
    updatePresence: true,     // Show "Active" on Messenger
    autoMarkDelivery: true    // Automatically mark messages as read
  });

  // Message event handler
  const listen = require("fb-chat-listen");
  listen(api, async (err, message) => {
    if (err) return console.error("📩 Listen Error:", err);

    const body = message.body || "";         // Message text
    const senderID = message.senderID;       // Who sent the message
    const threadID = message.threadID;       // Thread (group/inbox) ID

    // If message doesn't start with bot prefix, ignore
    if (!body.startsWith(config.PREFIX)) return;

    // Parse command and arguments
    const args = body.slice(config.PREFIX.length).trim().split(/\s+/);
    const commandName = args.shift().toLowerCase();

    // Run command if it exists
    if (GoatBot.commands.has(commandName)) {
      try {
        await GoatBot.commands.get(commandName).run({
          api,
          message,
          args,
          event: message,
          config,
          senderID,
          threadID
        });
      } catch (err) {
        console.error("❌ Command execution error:", err);
        api.sendMessage("❌ Error executing command.", threadID);
      }
    }
  });
});
