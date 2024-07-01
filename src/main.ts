import {
	App,
	debounce,
	Debouncer,
	MarkdownView,
	Plugin,
	PluginSettingTab,
	Setting,
	TFile
} from 'obsidian';
import {DailyStatisticsDataManager} from "./DailyStatistics";
import {DailyStatisticsSettings} from "./Settting";


export default class MyPlugin extends Plugin {
	settings: DailyStatisticsSettings;
	statisticsDataManager: DailyStatisticsDataManager
	debouncedUpdate: Debouncer<[contents: string, filepath: string], void>;
	private statusBarItemEl: HTMLElement;


	async onload() {
		await this.loadSettings();


		// 因为可能出现文件还未加载到库中的情况，导致加载数据失败。
		await new Promise(resolve => setTimeout(resolve, 6 * 1000));

		this.statisticsDataManager = new DailyStatisticsDataManager(this.settings.dataFile, this.app, this);
		await this.statisticsDataManager.loadStatisticsData()


		this.debouncedUpdate = debounce((contents: string, filepath: string) => {
			console.info("debounce updateWordCount" + filepath)
			if (this.settings.statisticsFolder != null && this.settings.statisticsFolder != '' && this.settings.statisticsFolder != '/') {
				// 检查路径是否匹配
				if (!filepath.match(this.settings.statisticsFolder)) {
					console.log("文件路径不匹配，不统计" + filepath)
					return
				}
			}
			this.statisticsDataManager.updateWordCount(contents, filepath);

		}, 400, false);

		// // This creates an icon in the left ribbon.
		// const ribbonIconEl = this.addRibbonIcon('dice', 'Sample Plugin', (evt: MouseEvent) => {
		// 	// Called when the user clicks the icon.
		// 	new Notice('This is a notice!');
		// });
		// // Perform additional things with the ribbon
		// ribbonIconEl.addClass('my-plugin-ribbon-class');

		// 定时在的状态栏更新本日字数
		this.statusBarItemEl = this.addStatusBarItem();
		// statusBarItemEl.setText('Status Bar Text');
		this.registerInterval(
			window.setInterval(() => {
				this.statusBarItemEl.setText(this.statisticsDataManager.currentWordCount + " words today ");
			}, 1000)
		);


		// 在快速预览时，更新统计数据
		this.registerEvent(
			this.app.workspace.on("quick-preview", this.onQuickPreview.bind(this))
		);

		// 定时保存数据
		this.registerInterval(window.setInterval(() => {
			this.statisticsDataManager.saveStatisticsData();
		}, 1000));


		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, new DailyStatisticsSettings(), await this.loadData());
	}


	// 保存配置文件
	async saveSettings() {
		// 先获取最新的数据，再将新的配置保存进去
		const data = await this.loadData()
		Object.assign(data, this.settings);
		await this.saveData(data);
	}


	// 在预览时更新统计字数
	onQuickPreview(file: TFile, contents: string) {
		if (this.app.workspace.getActiveViewOfType(MarkdownView)) {
			this.debouncedUpdate(contents, file.path);
		}
	}


}


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
			.setDesc('设置每日统计数据保存地址，如果为空，则保存在默认的插件目录下')
			.addText(text => text
				.setValue(this.plugin.settings.dataFile)
				.onChange(async (value) => {
					this.plugin.settings.dataFile = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('统计目录')
			.setDesc('设置需要统计数据的目录，如果为空，则统计全库的数据')
			.addText(text => text
				.setPlaceholder('全部')
				.setValue(this.plugin.settings.statisticsFolder)
				.onChange(async (value) => {
					this.plugin.settings.statisticsFolder = value;
					await this.plugin.saveSettings();
				}));
	}
}

