import {
	App,
	debounce,
	Debouncer,
	Editor,
	MarkdownView,
	Modal,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
	TFile
} from 'obsidian';
import * as fs from 'fs';


interface WordCount {
	initial: number;
	current: number;
}

interface DailyStatisticsSettings {
	dayCounts: Record<string, number>;
	todaysWordCount: Record<string, WordCount>;
	mySetting: string
}

const DEFAULT_SETTINGS: DailyStatisticsSettings = {
	dayCounts: {},
	todaysWordCount: {},
	mySetting: 'default'
}

export default class MyPlugin extends Plugin {
	settings: DailyStatisticsSettings;
	currentWordCount: number;
	today: string;
	debouncedUpdate: Debouncer<[contents: string, filepath: string], void>;
	private statusBarItemEl: HTMLElement;


	async onload() {

		await this.loadSettings();
		this.updateDate();
		if (this.settings.dayCounts.hasOwnProperty(this.today)) {
			this.updateCounts();
		} else {
			this.currentWordCount = 0;
		}
		this.debouncedUpdate = debounce((contents: string, filepath: string) => {
			this.updateWordCount(contents, filepath);
		}, 400, false);

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('dice', 'Sample Plugin', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			new Notice('This is a notice!');
		});
		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		// 定时在的状态栏更新本日字数
		this.statusBarItemEl = this.addStatusBarItem();
		// statusBarItemEl.setText('Status Bar Text');
		this.registerInterval(
			window.setInterval(() => {
				this.statusBarItemEl.setText(this.currentWordCount + " words today ");
			}, 200)
		);


		this.registerEvent(
			this.app.workspace.on("quick-preview", this.onQuickPreview.bind(this))
		);


		// 定时更新日期和保存设置
		this.registerInterval(window.setInterval(() => {
			this.updateDate();
			this.saveSettings();
		}, 1000));

		// // This adds a simple command that can be triggered anywhere
		// this.addCommand({
		// 	id: 'open-sample-modal-simple',
		// 	name: 'Open sample modal (simple)',
		// 	callback: () => {
		// 		new SampleModal(this.app).open();
		// 	}
		// });
		// // This adds an editor command that can perform some operation on the current editor instance
		// this.addCommand({
		// 	id: 'sample-editor-command',
		// 	name: 'Sample editor command',
		// 	editorCallback: (editor: Editor, view: MarkdownView) => {
		// 		console.log(editor.getSelection());
		// 		editor.replaceSelection('Sample Editor Command');
		// 	}
		// });
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		// this.addCommand({
		// 	id: 'open-sample-modal-complex',
		// 	name: 'Open sample modal (complex)',
		// 	checkCallback: (checking: boolean) => {
		// 		// Conditions to check
		// 		const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
		// 		if (markdownView) {
		// 			// If checking is true, we're simply "checking" if the command can be run.
		// 			// If checking is false, then we want to actually perform the operation.
		// 			if (!checking) {
		// 				new SampleModal(this.app).open();
		// 			}
		//
		// 			// This command will only show up in Command Palette when the check function returns true
		// 			return true;
		// 		}
		// 	}
		// });

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		// this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
		// 	console.log('click', evt);
		// });

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		// this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));

		// const content = readLocalFile(this.app)
		// console.log(content)


	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	// 在预览时更新统计字数
	onQuickPreview(file: TFile, contents: string) {
		if (this.app.workspace.getActiveViewOfType(MarkdownView)) {
			this.debouncedUpdate(contents, file.path);
		}
	}


	//Credit: better-word-count by Luke Leppan (https://github.com/lukeleppan/better-word-count)
	getWordCount(text: string) {
		// let words = 0;
		//
		// const matches = text.match(
		// 	/[a-zA-Z0-9_\u0392-\u03c9\u00c0-\u00ff\u0600-\u06ff]+|[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff\u3040-\u309f\uac00-\ud7af]+/gm
		// );
		//
		// if (matches) {
		// 	for (let i = 0; i < matches.length; i++) {
		// 		if (matches[i].charCodeAt(0) > 19968) {
		// 			words += matches[i].length;
		// 		} else {
		// 			words += 1;
		// 		}
		// 	}
		// }
		//
		// return words;
		return text.length
	}


	updateWordCount(contents: string, filepath: string) {
		const curr = this.getWordCount(contents);
		if (this.settings.dayCounts.hasOwnProperty(this.today)) {
			if (this.settings.todaysWordCount.hasOwnProperty(filepath)) {//updating existing file
				this.settings.todaysWordCount[filepath].current = curr;
			} else {//created new file during session
				this.settings.todaysWordCount[filepath] = {initial: curr, current: curr};
			}
		} else {//new day, flush the cache
			this.settings.todaysWordCount = {};
			this.settings.todaysWordCount[filepath] = {initial: curr, current: curr};
		}
		this.updateCounts();
	}

	updateDate() {
		const d = new Date();
		this.today = d.getFullYear() + "/" + d.getMonth() + "/" + d.getDate();
	}


	updateCounts() {
		this.currentWordCount = Object.values(this.settings.todaysWordCount).map((wordCount) => Math.max(0, wordCount.current - wordCount.initial)).reduce((a, b) => a + b, 0);
		this.settings.dayCounts[this.today] = this.currentWordCount;
	}
}

// class SampleModal extends Modal {
// 	constructor(app: App) {
// 		super(app);
// 	}
//
// 	onOpen() {
// 		const {contentEl} = this;
// 		contentEl.setText('Woah!');
// 	}
//
// 	onClose() {
// 		const {contentEl} = this;
// 		contentEl.empty();
// 	}
//
//
// }


class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}


async function readLocalFile(app: App) {
	// 先判断文件夹是否存在
	const folder = app.vault.configDir + "/daily-statistics";


	// if (!await app.vault.adapter.exists(folder)) {
	// 	console.info('Folder not found, create folder');
	// 	await app.vault.createFolder(folder);
	// }

	// 获取当年的年份
	const currentYear = new Date().getFullYear();
	// 判断文件是否存在
	const filePath = folder + "/" + currentYear + ".json";

	if (!checkFilesExistSync(filePath)) {
		console.info('File not found, create file');

	}
	let tFile: TFile | null = app.vault.getFileByPath(filePath);
	if (!await app.vault.adapter.exists(filePath)) {
		console.info('File not found, create file');
		// 创建文件
		tFile = await app.vault.create(filePath, "{}");
	}

	try {
		console.info('Read file:', tFile);
		return await app.vault.read(<TFile>tFile);
	} catch (error) {
		console.error('Error reading file:', error);
		return null;
	}
}

const checkFilesExistSync = (path: string) => {
	try {
		fs.accessSync(path, fs.constants.F_OK);
		return true;
	} catch (err) {
		return false;
	}


};

// async function writeLocalFile(plugin, filePath, content) {
// 	const file = plugin.vault.getAbstractFileByPath(filePath);
// 	if (!file) {
// 		console.error('File not found:', filePath);
// 		return;
// 	}
// 	try {
// 		await plugin.vault.writeFile(file, content);
// 	} catch (error) {
// 		console.error('Error writing file:', error);
// 	}
// }
