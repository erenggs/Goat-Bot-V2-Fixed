module.exports = {
  config: {
    name: "help",
    aliases: ["menu", "commands"],
    version: "3.2",
    author: "eran_hossain",
    shortDescription: "Show all available commands",
    longDescription: "Display a categorized list of all available commands.",
    category: "system",
    guide: "{pn}help [command name]"
  },

  onStart: async function ({ message, args, prefix }) {
    const allCommands = global.GoatBot.commands;
    const categories = {};

    const cleanCategoryName = (text) => {
      if (!text) return "others";
      return text
        .normalize("NFKD")
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();
    };

    const formatCategoryTitle = (text) => {
      return text
        .split(" ")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    };

    // Categorize commands
    for (const [, cmd] of allCommands) {
      const rawCat = cmd.config.category || "others";
      const cat = cleanCategoryName(rawCat);
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(cmd.config.name);
    }

    // If user requested a specific command
    if (args[0]) {
      const query = args[0].toLowerCase();
      const cmd = allCommands.get(query) || [...allCommands.values()].find(c => (c.config.aliases || []).includes(query));
      if (!cmd) return message.reply(`❌ Command "${query}" not found.`);

      const { name, version, author, guide, category, shortDescription, longDescription, aliases } = cmd.config;

      const desc = typeof longDescription === "string"
        ? longDescription
        : (longDescription?.en || shortDescription || shortDescription?.en || "No description available");

      return message.reply(
        `✨ Command Info\n\n` +
        `Name: ${name}\n` +
        `Category: ${category || "Unknown"}\n` +
        `Description: ${desc}\n` +
        `Aliases: ${aliases?.length ? aliases.join(", ") : "None"}\n` +
        `Usage: ${typeof guide === "string" ? guide.replace(/{pn}/g, prefix) : `${prefix}${name}`}\n` +
        `Author: ${author || "Unknown"}\n` +
        `Version: ${version || "1.0"}`
      );
    }

    // General help message
    let msg = "";
    const sortedCats = Object.keys(categories).sort();
    let total = 0;

    for (const cat of sortedCats) {
      const cmds = categories[cat]
        .sort((a, b) => a.localeCompare(b))
        .map(c => `🖥️ ${c}`)
        .join(",\n│ ");
      total += categories[cat].length;
      msg += `──────────────  ${formatCategoryTitle(cat)}  ──────────────\n`;
      msg += `│ ${cmds}\n`;
      msg += `╰───────────────────────────────\n\n`;
    }

    msg += `◎ Eran_hossain • https://www.facebook.com/profile.php?id=100083613360627\n`;
    msg += `Total Commands » ${total}\n`;
    msg += `Use "${prefix}help [command]" for details`;

    return message.reply(msg.trim());
  }
};
