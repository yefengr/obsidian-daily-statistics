import {
  debounce,
  type Debouncer,
  MarkdownView,
  Plugin,
  TFile,
  type WorkspaceLeaf
} from "obsidian";
import { DailyStatisticsSettings } from "@/data/Settting";
import { DailyStatisticsDataManager, type DailyStatisticsDataSaveListener } from "@/data/StatisticsDataManager";
import { CalendarView, Calendar_View } from "@/ui/calendar/CalendarView";
import { SampleSettingTab } from "@/ui/setting/SampleSettingTab";
import i18n, { type I18n } from "simplest-i18n";


/**
 * 插件核心类
 */
export default class DailyStatisticsPlugin extends Plugin {
  settings!: DailyStatisticsSettings;
  statisticsDataManager!: DailyStatisticsDataManager;
  debouncedUpdate!: Debouncer<[contents: string, filepath: string], void>;
  private statusBarItemEl!: HTMLElement;
  t!: I18n;
  calendarView!: CalendarView;

  async onload() {
    await this.loadSettings();


    this.statisticsDataManager = new DailyStatisticsDataManager(
      this.settings.dataFile,
      this.app,
      this
    );
    this.statisticsDataManager.loadStatisticsData().then(() => {
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

    this.t = i18n({
      locale: this.settings.language,
      locales: [
        "zh-cn",
        "en"
      ]
    });

    // 定时在的状态栏更新本日字数
    this.statusBarItemEl = this.addStatusBarItem();
    // statusBarItemEl.setText('Status Bar Text');
    this.registerInterval(
      window.setInterval(() => {
        this.statusBarItemEl.setText(
          this.t("今日字数：", "Today's word count: ") +
          this.statisticsDataManager.currentWordCount
        )
        ;
      }, 1000)
    );

    // 在快速预览时，更新统计数据
    this.registerEvent(
      this.app.workspace.on("quick-preview", this.onQuickPreview.bind(this))
    );

    // This adds a settings tab so the user can configure various aspects of the plugin
    this.addSettingTab(new SampleSettingTab(this.app, this));

    this.registerView(Calendar_View, (leaf) => {
      this.calendarView = new CalendarView(leaf, this);
      return this.calendarView;
    });
    new Promise(() => {
      setTimeout(() => {
        this.activateView();
      }, 1000);
    });


    this.addCommand({
      id: "open-calendar",
      name: this.t("打开日历面板", "Open calendar panel"),
      callback: () => {
        this.activateView();
      }
    });
  }


  onunload() {
    // this.statusBarItemEl.remove()
    this.removeView().then();

  }


  // 重新加载
  async languageChange() {
    this.t = i18n({
      locale: this.settings.language,
      locales: [
        "zh-cn",
        "en"
      ]
    });
    await this.calendarView.onClose();
    await this.calendarView.onOpen();
    this.addCommand({
      id: "open-calendar",
      name: this.t("打开日历面板", "Open calendar panel"),
      callback: () => {
        this.activateView();
      }
    });
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

  // 移除视图
  async removeView() {
    const { workspace } = this.app;
    const leaves = workspace.getLeavesOfType(Calendar_View);
    if (leaves.length > 0) {
      // A leaf with our view already exists, use that
      workspace.detachLeavesOfType(Calendar_View);
    }
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
    let data = await this.loadData();
    if (data == null) {
      data = new DailyStatisticsSettings();
    }
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



