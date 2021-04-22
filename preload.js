const path = require("path");

const { remote } = require("electron");

const config = require("./config");
const { fileExists } = require("./plugins/utils");

const plugins = config.plugins.getEnabled();

plugins.forEach(([plugin, options]) => {
	const preloadPath = path.join(__dirname, "plugins", plugin, "preload.js");
	fileExists(preloadPath, () => {
		const run = require(preloadPath);
		run(options);
	});

	const actionPath = path.join(__dirname, "plugins", plugin, "actions.js");
	fileExists(actionPath, () => {
		const actions = require(actionPath).actions || {};

		// TODO: re-enable once contextIsolation is set to true
		// contextBridge.exposeInMainWorld(plugin + "Actions", actions);
		Object.keys(actions).forEach((actionName) => {
			global[actionName] = actions[actionName];
		});
	});
});

document.addEventListener("DOMContentLoaded", () => {
	plugins.forEach(([plugin, options]) => {
		const pluginPath = path.join(__dirname, "plugins", plugin, "front.js");
		fileExists(pluginPath, () => {
			const run = require(pluginPath);
			run(options);
		});
	});

	// inject song-info provider
	const songInfoProviderPath = path.join(__dirname, "providers", "song-info-front.js")
	fileExists(songInfoProviderPath, require(songInfoProviderPath));
	
	// Add action for reloading
	global.reload = () =>
		remote.getCurrentWindow().webContents.loadURL(config.get("url"));
});
