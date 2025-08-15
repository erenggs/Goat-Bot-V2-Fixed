const { readdirSync, readFileSync, writeFileSync, existsSync } = require("fs-extra");
const path = require("path");
const { log, loading, getText, colors, removeHomeDir } = global.utils;
const { GoatBot } = global;
const { configCommands } = GoatBot;

const exec = (cmd, options = {}) => new Promise((resolve, reject) => {
	require("child_process").exec(cmd, options, (err, stdout) => err ? reject(err) : resolve(stdout));
});

const regExpCheckPackage = /require\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g;
const packageAlready = [];
const spinner = ['⠋','⠙','⠹','⠸','⠼','⠴','⠦','⠧','⠇','⠏'];
let count = 0;

module.exports = async function (api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData, createLine) {
	// Load aliases
	const aliasesData = await globalData.get('setalias', 'data', []);
	if (aliasesData) {
		for (const { aliases, commandName } of aliasesData) {
			for (const alias of aliases) {
				if (GoatBot.aliases.has(alias))
					throw new Error(`Alias "${alias}" already exists in command "${commandName}"`);
				GoatBot.aliases.set(alias, commandName);
			}
		}
	}

	const folders = ["cmds", "events"];

	for (const folderModules of folders) {
		const headerText = folderModules === "cmds" ? createLine("LOAD COMMANDS") : createLine("LOAD EVENT COMMANDS");
		console.log(colors.hex("#f5ab00")(headerText));

		const text = folderModules === "cmds" ? "command" : "event command";
		const typeEnvCommand = folderModules === "cmds" ? "envCommands" : "envEvents";
		const setMap = folderModules === "cmds" ? "commands" : "eventCommands";

		const fullPathModules = path.join(process.cwd(), "scripts", folderModules);
		const Files = readdirSync(fullPathModules)
			.filter(file =>
				file.endsWith(".js") &&
				!file.endsWith("eg.js") &&
				(process.env.NODE_ENV === "development" || !file.match(/(dev)\.js$/)) &&
				!configCommands[folderModules === "cmds" ? "commandUnload" : "commandEventUnload"]?.includes(file)
			);

		const commandError = [];
		let commandLoadSuccess = 0;

		for (const file of Files) {
			const pathCommand = path.join(fullPathModules, file);

			try {
				const contentFile = readFileSync(pathCommand, "utf8");

				// ——— Install missing packages ———
				let allPackages = contentFile.match(regExpCheckPackage)?.map(p => p.match(/['"`]([^'"`]+)['"`]/)[1])
					.filter(p => !p.startsWith("/") && !p.startsWith(".") && !p.startsWith(__dirname)) || [];

				for (let packageName of allPackages) {
					if (packageName.startsWith('@')) packageName = packageName.split('/').slice(0, 2).join('/');
					else packageName = packageName.split('/')[0];

					if (!packageAlready.includes(packageName)) {
						packageAlready.push(packageName);
						if (!existsSync(path.join(process.cwd(), "node_modules", packageName))) {
							const waiting = setInterval(() => {
								loading.info('PACKAGE', `${spinner[count % spinner.length]} Installing package ${colors.yellow(packageName)} for ${text} ${colors.yellow(file)}`);
								count++;
							}, 80);

							try {
								await exec(`npm install ${packageName} --${pathCommand.endsWith('.dev.js') ? 'no-save' : 'save'}`);
								clearInterval(waiting);
								process.stderr.write('\r\x1b[K');
								console.log(`${colors.green('✔')} installed package ${packageName} successfully`);
							} catch (err) {
								clearInterval(waiting);
								process.stderr.write('\r\x1b[K');
								console.log(`${colors.red('✖')} failed to install package ${packageName}`);
								throw new Error(`Can't install package ${packageName}`);
							}
						}
					}
				}

				global.temp.contentScripts[folderModules][file] = contentFile;

				const command = require(pathCommand);
				command.location = pathCommand;
				const { config: configCommand } = command;
				if (!configCommand) throw new Error(`config of ${text} undefined`);

				const { name: commandName, category, aliases, envGlobal, envConfig, onStart, onFirstChat, onChat, onLoad, onEvent, onAnyEvent } = configCommand;

				if (!category) throw new Error(`category of ${text} undefined`);
				if (!commandName) throw new Error(`name of ${text} undefined`);
				if (!onStart || typeof onStart !== "function") throw new Error(`onStart of ${text} must be a function`);
				if (GoatBot[setMap].has(commandName)) throw new Error(`${text} "${commandName}" already exists`);

				// ——— Validate aliases ———
				const validAliases = [];
				if (aliases) {
					if (!Array.isArray(aliases)) throw new Error("config.aliases must be an array");
					for (const alias of aliases) {
						if (aliases.filter(a => a === alias).length > 1) throw new Error(`Duplicate alias "${alias}"`);
						if (GoatBot.aliases.has(alias)) throw new Error(`Alias "${alias}" already exists`);
						validAliases.push(alias);
					}
					for (const alias of validAliases) GoatBot.aliases.set(alias, commandName);
				}

				// ——— Apply envGlobal & envConfig ———
				if (envGlobal && typeof envGlobal === "object" && !Array.isArray(envGlobal)) {
					for (const key in envGlobal) {
						configCommands.envGlobal[key] ||= envGlobal[key];
					}
				}

				if (envConfig && typeof envConfig === "object" && !Array.isArray(envConfig)) {
					configCommands[typeEnvCommand] ||= {};
					configCommands[typeEnvCommand][commandName] ||= {};
					for (const [key, value] of Object.entries(envConfig)) {
						configCommands[typeEnvCommand][commandName][key] ||= value;
					}
				}

				if (onLoad) {
					if (typeof onLoad !== "function") throw new Error("onLoad must be a function");
					await onLoad({ api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData });
				}

				if (onChat) GoatBot.onChat.push(commandName);
				if (onFirstChat) GoatBot.onFirstChat.push({ commandName, threadIDsChattedFirstTime: [] });
				if (onEvent) GoatBot.onEvent.push(commandName);
				if (onAnyEvent) GoatBot.onAnyEvent.push(commandName);

				GoatBot[setMap].set(commandName.toLowerCase(), command);
				global.GoatBot[folderModules === "cmds" ? "commandFilesPath" : "eventCommandsFilesPath"].push({
					filePath: pathCommand,
					commandName: [commandName, ...validAliases]
				});

				commandLoadSuccess++;
			} catch (error) {
				commandError.push({ name: file, error });
			}

			loading.info('LOADED', `${colors.green(`${commandLoadSuccess}`)}${commandError.length ? `, ${colors.red(`${commandError.length}`)}` : ''}`);
		}

		console.log("\n");
		if (commandError.length > 0) {
			log.err("LOADED", getText('loadScripts', 'loadScriptsError', colors.yellow(text)));
			for (const { name, error } of commandError)
				console.log(` ${colors.red('✖ ' + name)}: ${error.message}\n`, error);
		}
	}
};
