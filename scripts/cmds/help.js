module.exports = {
  config: {
    name: "help",
    aliases: ["menu", "commands"],
    version: "3.1",
    author: "nexo_here",
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

    for (const [, cmd] of allCommands) {
      const rawCat = cmd.config.category || "others";
      const cat = cleanCategoryName(rawCat);
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(cmd.config.name);
    }

    if (args[0]) {
      const query = args[0].toLowerCase();
      const cmd = allCommands.get(query) || [...allCommands.values()].find(c => (c.config.aliases || []).includes(query));
      if (!cmd) return message.reply(`❌ Command "${query}" not found.`);

      const {
        name,
        version,
        author,
        guide,
        category,
        shortDescription,
        longDescription,
        aliases
      } = cmd.config;

      const desc =
        (typeof longDescription === "string")
          ? longDescription
          : (longDescription?.en || (typeof shortDescription === "string" ? shortDescription : (shortDescription?.en || "No description")));

      return message.reply(
        `✨ Command Info\n\n` +
        `Name: ${name}\n` +
        `Category: ${category || "Unknown"}\n` +
        `Description: ${desc}\n` +
        `Aliases: ${aliases?.length ? aliases.join(", ") : "None"}\n` +
        `Usage: ${typeof guide === "string" ? guide.replace(/{pn}/g, prefix) : prefix + name}\n` +
        `Author: ${author || "Unknown"}\n` +
        `Version: ${version || "1.0"}`
      );
    }

    // Final message layout
    let msg = "";
    const sortedCats = Object.keys(categories).sort();
    let total = 0;

    for (const cat of sortedCats) {
      const cmds = categories[cat]
        .sort((a, b) => a.localeCompare(b))
        .map(c => `✧${c}`)
        .join(",\n│ ");
      total += categories[cat].length;
      msg += `╭──『 ${formatCategoryTitle(cat)} 』\n`;
      msg += `│ ${cmds}\n`;
      msg += `╰────────♢\n\n`;
    }

    msg += `◎ Eren Ai\n`;
    msg += `Total Commands » ${total}\n`;
    msg += `Use help (cmd name) to see cmd usage details`;

    return message.reply(msg.trim());
  }
};
