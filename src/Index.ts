import {
  addIcon,
  debounce,
  type Debouncer,
  MarkdownView,
  Plugin,
  TFile,
  type WorkspaceLeaf
} from "obsidian";
import { DailyStatisticsSettings } from "@/data/Settting";
import { DailyStatisticsDataManager } from "@/data/StatisticsDataManager";
import { CalendarView, Calendar_View } from "@/ui/calendar/CalendarView";
import { SampleSettingTab } from "@/ui/setting/SampleSettingTab";


/**
 * 插件核心类
 */
export default class MyPlugin extends Plugin {
  settings!: DailyStatisticsSettings;
  statisticsDataManager!: DailyStatisticsDataManager;
  debouncedUpdate!: Debouncer<[contents: string, filepath: string], void>;
  private statusBarItemEl!: HTMLElement;

  async onload() {
    await this.loadSettings();


    // 因为可能出现文件还未加载到库中的情况，导致加载数据失败。
    // await new Promise((resolve) => setTimeout(resolve, 6 * 1000));

    // 异步执行操作
    new Promise((resolve) => setTimeout(resolve, 6 * 1000));


    this.statisticsDataManager = new DailyStatisticsDataManager(
      this.settings.dataFile,
      this.app,
      this
    );
    this.statisticsDataManager.loadStatisticsData().then(r => {
      console.info("loadStatisticsData success. ");
    });
    this.debouncedUpdate = debounce(
      (contents: string, filepath: string) => {
        // console.info("debounce updateWordCount" + filepath);
        if (
          this.settings.statisticsFolder != null &&
          this.settings.statisticsFolder != "" &&
          this.settings.statisticsFolder != "/"
        ) {
          // 检查路径是否匹配
          if (!filepath.match(this.settings.statisticsFolder)) {
            // console.log("文件路径不匹配，不统计" + filepath);
            return;
          }
        }
        this.statisticsDataManager.updateWordCount(contents, filepath);
      },
      400,
      false
    );

    // 定时在的状态栏更新本日字数
    this.statusBarItemEl = this.addStatusBarItem();
    // statusBarItemEl.setText('Status Bar Text');
    this.registerInterval(
      window.setInterval(() => {
        this.statusBarItemEl.setText(
          this.statisticsDataManager.currentWordCount + " words today "
        );
      }, 1000)
    );

    // 在快速预览时，更新统计数据
    this.registerEvent(
      this.app.workspace.on("quick-preview", this.onQuickPreview.bind(this))
    );
    //
    // // 定时保存数据
    // this.registerInterval(
    //   window.setInterval(() => {
    //     this.statisticsDataManager.saveStatisticsData();
    //   }, 1000)
    // );

    // This adds a settings tab so the user can configure various aspects of the plugin
    this.addSettingTab(new SampleSettingTab(this.app, this));
    // this.addSettingTab(new SampleSettingTab2(this.app, this));

    this.registerView(Calendar_View, (leaf) => new CalendarView(leaf, this));
    await this.activateView();

    this.addCommand({
      id: "obsidian-daily-statistics-open-calendar",
      name: "打开日历面板",
      callback: () => {
        this.activateView();
      }
    });
  }

  onunload() {
  }

  async activateView() {
    const { workspace } = this.app;

    let leaf: WorkspaceLeaf | null = null;
    const leaves = workspace.getLeavesOfType(Calendar_View);

    if (leaves.length > 0) {
      // A leaf with our view already exists, use that
      leaf = leaves[0];
    } else {
      // Our view could not be found in the workspace, create a new leaf
      // in the right sidebar for it
      leaf = workspace.getRightLeaf(false);
      if (leaf == null) {
        console.error("leaf is null");
        return;
      }
      await leaf.setViewState({ type: Calendar_View, active: true });
    }

    // "Reveal" the leaf in case it is in a collapsed sidebar
    workspace.revealLeaf(leaf);
  }

  async loadSettings() {
    this.settings = Object.assign(
      {},
      new DailyStatisticsSettings(),
      await this.loadData()
    );
  }

  // 保存配置文件
  async saveSettings() {
    // 先获取最新的数据，再将新的配置保存进去
    const data = await this.loadData();
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

