const axios = require('axios');
const _ = require('lodash');
const fs = require('fs-extra');
const path = require('path');
const log = require('./logger/log.js');
const execSync = require('child_process').execSync;

let chalk;
try { chalk = require('./func/colors.js').colors; } 
catch (e) { chalk = require('chalk'); }

const sep = path.sep;
const currentConfig = require('./config.json');
const langCode = currentConfig.language;

// --------------------- Language Loader ---------------------
function loadLanguage(lang) {
	let langFile = path.join(process.cwd(), 'languages', `${lang}.lang`);
	if (!fs.existsSync(langFile)) {
		log.warn("LANGUAGE", `Can't find language file ${lang}, using default.`);
		langFile = path.join(process.cwd(), 'languages', 'en.lang');
	}
	const data = fs.readFileSync(langFile, 'utf-8')
		.split(/\r?\n|\r/)
		.filter(line => line && !line.trim().startsWith('#') && !line.trim().startsWith('//'));
	global.language = {};
	for (const line of data) {
		const i = line.indexOf('=');
		if (i === -1) continue;
		const key = line.slice(0, i).trim();
		const value = line.slice(i + 1).trim().replace(/\\n/g, '\n');
		const [head, subKey] = key.split('.');
		if (!global.language[head]) global.language[head] = {};
		global.language[head][subKey] = value;
	}
}

function getText(head, key, ...args) {
	const text = global.language[head]?.[key];
	if (!text) return `Can't find text: "${head}.${key}"`;
	return args.reduce((str, val, i) => str.replace(new RegExp(`%${i + 1}`, 'g'), val), text);
}

loadLanguage(langCode);

// --------------------- Helpers ---------------------
function checkAndCreateFolder(folderPath) {
	const parts = path.normalize(folderPath).split(sep);
	let current = '';
	for (const p of parts) {
		if (!p) continue;
		current = path.join(current, p);
		if (!fs.existsSync(current)) fs.mkdirSync(current);
	}
}

function sortObject(obj, parent, rootKeys, stringKey = '') {
	const root = sortObjectRoot(obj, rootKeys);
	for (const key in root) {
		if (_.isPlainObject(root[key])) {
			const newKey = stringKey ? stringKey + '.' + key : key;
			root[key] = sortObject(root[key], parent, Object.keys(_.get(parent, newKey) || {}), newKey);
		}
	}
	return root;
}

function sortObjectRoot(obj, rootKeys) {
	const sorted = Object.keys(obj).sort((a, b) => {
		const idxA = rootKeys.indexOf(a) === -1 ? 9999 : rootKeys.indexOf(a);
		const idxB = rootKeys.indexOf(b) === -1 ? 9999 : rootKeys.indexOf(b);
		return idxA - idxB;
	});
	return sorted.reduce((res, k) => { res[k] = obj[k]; return res; }, {});
}

// Override fs methods
const _writeFile = fs.writeFileSync;
const _copyFile = fs.copyFileSync;
fs.writeFileSync = (file, data) => { checkAndCreateFolder(path.dirname(file)); _writeFile(file, data); };
fs.copyFileSync = (src, dest) => { checkAndCreateFolder(path.dirname(dest)); _copyFile(src, dest); };

// --------------------- Main Updater ---------------------
(async function updater() {
	try {
		// --- Check Last Commit ---
		const { data: lastCommit } = await axios.get('https://api.github.com/repos/ntkhang03/Goat-Bot-V2/commits/main');
		const lastDate = new Date(lastCommit.commit.committer.date);
		const diff = Date.now() - lastDate.getTime();
		if (diff < 5 * 60 * 1000) {
			const m = Math.floor((5 * 60 * 1000 - diff)/1000/60);
			const s = Math.floor((5 * 60 * 1000 - diff)/1000 % 60);
			return log.error("ERROR", getText("updater","updateTooFast", m, s));
		}

		// --- Load Versions ---
		const { data: versions } = await axios.get('https://raw.githubusercontent.com/ntkhang03/Goat-Bot-V2/main/versions.json');
		const currentVersion = require('./package.json').version;
		const idx = versions.findIndex(v => v.version === currentVersion);
		if (idx === -1) return log.error("ERROR", getText("updater","cantFindVersion", chalk.yellow(currentVersion)));
		const updates = versions.slice(idx + 1);
		if (!updates.length) return log.info("SUCCESS", getText("updater","latestVersion"));

		fs.writeFileSync(path.join(process.cwd(), 'versions.json'), JSON.stringify(versions, null, 2));
		log.info("UPDATE", getText("updater","newVersions", chalk.yellow(updates.length)));

		// --- Prepare Update ---
		const updatePlan = { version:"", files:{}, deleteFiles:{}, reinstallDependencies:false };
		for(const v of updates){
			updatePlan.version = v.version;
			Object.assign(updatePlan.files, v.files || {});
			Object.assign(updatePlan.deleteFiles, v.deleteFiles || {});
			if(v.reinstallDependencies) updatePlan.reinstallDependencies = true;
		}

		// --- Backup ---
		const backupsDir = path.join(process.cwd(), 'backups');
		fs.ensureDirSync(backupsDir);
		const backupFolder = path.join(backupsDir, `backup_${currentVersion}`);
		for(const f of fs.readdirSync(process.cwd()).filter(f=>f.startsWith('backup_') && fs.lstatSync(f).isDirectory())){
			await fs.move(f, path.join(backupsDir, f));
		}

		log.info("UPDATE", `Update to version ${chalk.yellow(updatePlan.version)}`);

		// --- Update Files ---
		for(const filePath in updatePlan.files){
			const fullPath = path.join(process.cwd(), filePath);
			let fileData;
			try {
				const res = await axios.get(`https://github.com/ntkhang03/Goat-Bot-V2/raw/main/${filePath}`, { responseType:'arraybuffer' });
				fileData = res.data;
			}catch{ continue; }

			if(["config.json","configCommands.json"].includes(filePath)){
				const cfg = fs.existsSync(fullPath) ? JSON.parse(fs.readFileSync(fullPath,'utf-8')) : {};
				const cfgUpdate = updatePlan.files[filePath];
				for(const key in cfgUpdate){
					const val = cfgUpdate[key];
					_.set(cfg, key, val.startsWith?.("DEFAULT_") ? _.get(cfg, val.replace("DEFAULT_","")) : val);
				}
				const sorted = sortObject(cfg, cfg, Object.keys(cfg));
				if(fs.existsSync(fullPath)) fs.copyFileSync(fullPath, path.join(backupFolder,filePath));
				fs.writeFileSync(fullPath, JSON.stringify(sorted,null,2));
				console.log(chalk.bold.blue('[↑]'), filePath);
				console.log(chalk.bold.yellow('[!]'), getText("updater","configChanged", chalk.yellow(filePath)));
			} else {
				const skipMarkers = ["DO NOT UPDATE","SKIP UPDATE","DO NOT UPDATE THIS FILE"];
				if(fs.existsSync(fullPath)){
					fs.copyFileSync(fullPath, path.join(backupFolder,filePath));
					const firstLine = fs.readFileSync(fullPath,'utf-8').split(/\r?\n/)[0];
					if(skipMarkers.some(s=>firstLine.includes(s))){
						console.log(chalk.bold.yellow('[!]'), getText("updater","skipFile", chalk.yellow(filePath)));
						continue;
					}
				}
				fs.writeFileSync(fullPath, Buffer.from(fileData));
				console.log(fs.existsSync(fullPath)? chalk.bold.blue('[↑]') : chalk.bold.green('[+]'), filePath);
			}
		}

		// --- Delete Files ---
		for(const filePath in updatePlan.deleteFiles){
			const fullPath = path.join(process.cwd(), filePath);
			if(fs.existsSync(fullPath)){
				if(fs.lstatSync(fullPath).isDirectory()) fs.removeSync(fullPath);
				else{
					fs.copyFileSync(fullPath, path.join(backupFolder,filePath));
					fs.unlinkSync(fullPath);
				}
				console.log(chalk.bold.red('[-]'), filePath);
			}
		}

		log.info("UPDATE", getText("updater","updateSuccess", updatePlan.reinstallDependencies ? "" : getText("updater","restartToApply")));

		// --- Reinstall Dependencies ---
		if(updatePlan.reinstallDependencies){
			log.info("UPDATE", getText("updater","installingPackages"));
			execSync("npm install",{stdio:'inherit'});
			log.info("UPDATE", getText("updater","installSuccess"));
		}

		log.info("UPDATE", getText("updater","backupSuccess", chalk.yellow(backupFolder)));

	} catch(err){
		log.error("ERROR", err);
	}
})();
