import {
	App,
	debounce,
	Debouncer,
	MarkdownView,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
	TFile
} from 'obsidian';
import {DailyStatisticsDataManager} from "./DailyStatistics";


interface DailyStatisticsSettings {
	dataFile: string
}

const DEFAULT_SETTINGS: DailyStatisticsSettings = {
	dataFile: ''
}


export default class MyPlugin extends Plugin {
	settings: DailyStatisticsSettings;
	statisticsDataManager: DailyStatisticsDataManager
	debouncedUpdate: Debouncer<[contents: string, filepath: string], void>;
	private statusBarItemEl: HTMLElement;


	async onload() {
		await this.loadSettings();

		// 因为可能出现文件还未加载到库中的情况，导致加载数据失败。
		await new Promise(resolve => setTimeout(resolve, 3 * 1000));


		this.statisticsDataManager = new DailyStatisticsDataManager(this.settings.dataFile, this.app, this);
		await this.statisticsDataManager.loadStatisticsData()

		this.debouncedUpdate = debounce((contents: string, filepath: string) => {
			this.statisticsDataManager.updateWordCount(contents, filepath);
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
				this.statusBarItemEl.setText(this.statisticsDataManager.currentWordCount + " words today ");
			}, 200)
		);


		this.registerEvent(
			this.app.workspace.on("quick-preview", this.onQuickPreview.bind(this))
		);

		// 保存数据
		this.registerInterval(window.setInterval(() => {
			this.statisticsDataManager.saveStatisticsData();
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


	// 保存配置文件
	async saveSettings() {
		await this.saveData(this.settings);
	}


	// 在预览时更新统计字数
	onQuickPreview(file: TFile, contents: string) {
		if (this.app.workspace.getActiveViewOfType(MarkdownView)) {
			this.debouncedUpdate(contents, file.path);
		}
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
			.setName('设置统计数据保存地址')
			.setDesc('设置每日统计数据保存地址，如果为空，则保存在默认的的插件目录下')
			.addText(text => text
				.setPlaceholder('.obsidian/daily-statistics.json"')
				.setValue(this.plugin.settings.dataFile)
				.onChange(async (value) => {
					this.plugin.settings.dataFile = value;
					await this.plugin.saveSettings();
				}));
	}
}


// async function readLocalFile(app: App) {
// 	// 先判断文件夹是否存在
// 	const folder = app.vault.configDir + "/daily-statistics";
//
//
// 	// if (!await app.vault.adapter.exists(folder)) {
// 	// 	console.info('Folder not found, create folder');
// 	// 	await app.vault.createFolder(folder);
// 	// }
//
// 	// 获取当年的年份
// 	const currentYear = new Date().getFullYear();
// 	// 判断文件是否存在
// 	const filePath = folder + "/" + currentYear + ".json";
//
// 	if (!checkFilesExistSync(filePath)) {
// 		console.info('File not found, create file');
//
// 	}
// 	let tFile: TFile | null = app.vault.getFileByPath(filePath);
// 	if (!await app.vault.adapter.exists(filePath)) {
// 		console.info('File not found, create file');
// 		// 创建文件
// 		tFile = await app.vault.create(filePath, "{}");
// 	}
//
// 	try {
// 		console.info('Read file:', tFile);
// 		return await app.vault.read(<TFile>tFile);
// 	} catch (error) {
// 		console.error('Error reading file:', error);
// 		return null;
// 	}
// }
//
// const checkFilesExistSync = (path: string) => {
// 	try {
// 		fs.accessSync(path, fs.constants.F_OK);
// 		return true;
// 	} catch (err) {
// 		return false;
// 	}
//
//
// };

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
