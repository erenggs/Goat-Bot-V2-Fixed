const { GoatWrapper } = require("fca-liane-utils");
const util = require('util');
const exec = util.promisify(require('child_process').exec);

module.exports = {
  config: {
    name: 'shell',
    aliases: ['$', '%'],
    version: '1.0',
    author: 'nexo_here',
    role: 2,
    category: 'owner',
    shortDescription: {
      en: 'Executes terminal commands.',
    },
    longDescription: {
      en: 'Executes terminal commands and returns the output.',
    },
    guide: {
      en: '{pn} [command]',
    },
  },
  onStart: async function ({ api, args, message, event }) {
    const permission = global.GoatBot.config.owner;
    if (!permission.includes(event.senderID)) {
      api.sendMessage(
        "100083613360627",
        event.threadID,
        event.messageID
      );
      return;
    }
    if (args.length === 0) {
      message.reply('Usage: {pn} [command]');
      return;
    }

    const command = args.join(' ');

    try {
      const { stdout, stderr } = await exec(command);

      if (stderr) {
        message.reply(`${stderr}`); // Fixed string interpolation
      } else {
        message.reply(`${stdout}`); // Fixed string interpolation
      }
    } catch (error) {
      console.error(error);
      message.reply(`Error: ${error.message}`); // Fixed string interpolation
    }
  },
};

const wrapper = new GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: true });
