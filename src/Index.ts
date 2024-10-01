import {
  debounce,
  type Debouncer,
  MarkdownView,
  Plugin,
  TFile,
  type WorkspaceLeaf,
} from "obsidian";
import { DailyStatisticsSettings } from "@/data/Settting";
import { DailyStatisticsDataManagerInstance } from "@/data/StatisticsDataManager";
import { CalendarView, Calendar_View } from "@/ui/calendar/CalendarView";
import { SampleSettingTab } from "@/ui/setting/SampleSettingTab";
import i18n from "@/lang";
import moment from "moment/moment";

/**
 * 插件核心类
 */
export default class DailyStatisticsPlugin extends Plugin {
  settings!: DailyStatisticsSettings;
  debouncedUpdate!: Debouncer<[contents: string, filepath: string], void>;
  private statusBarItemEl!: HTMLElement;
  calendarView!: CalendarView;

  async onload() {
    // 尽早的设置时间地域
    const locale = i18n.global.locale.value;
    if (locale == "zh_cn") {
      moment.locale("zh-cn", {
        week: {
          dow: 1,
        },
      });
    }

    const t = i18n.global.t;
    await this.loadSettings();

    DailyStatisticsDataManagerInstance.init(
      this.settings.dataFile,
      this.app,
      this
    );
    DailyStatisticsDataManagerInstance.loadStatisticsData()
      .then(() => {
        // 数据加载完成之后，再创建视图
        setTimeout(() => {
          try {
            this.registerView(Calendar_View, (leaf) => {
              this.calendarView = new CalendarView(leaf, this);
              return this.calendarView;
            });
          } catch (e) {
            console.error("registerView error", e);
          }

          this.openForTheFirstTime();
        }, 500);
      })
      .catch((e) => {
        console.error("loadStatisticsData error", e);
      });

    this.debouncedUpdate = debounce(
      (contents: string, filepath: string) => {
        // console.log("debounce updateWordCount" + filepath);
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
        DailyStatisticsDataManagerInstance.updateWordCount(contents, filepath);
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
          t("todaySWordCount") +
            DailyStatisticsDataManagerInstance.currentWordCount
        );
      }, 1000)
    );

    // 在快速预览时，更新统计数据
    this.registerEvent(
      this.app.workspace.on("quick-preview", this.onQuickPreview.bind(this))
    );
    // 当文件被打开时，便统计一次字数
    this.registerEvent(
      this.app.workspace.on("file-open", this.onFileOpen.bind(this))
    );

    // This adds a settings tab so the user can configure various aspects of the plugin
    this.addSettingTab(new SampleSettingTab(this.app, this));

    this.addCommand({
      id: "open-calendar",
      name: t("openTheCalendarPanel"),
      callback: () => {
        this.activateView();
      },
    });
  }

  // 自定义方法，通过 workspace API 检查视图类型是否已经加载
  isViewAlreadyLoaded(viewType) {
    const leaves = this.app.workspace.getLeavesOfType(viewType);
    return leaves.length > 0; // 如果有至少一个已存在的视图，返回 true
  }

  /**
   * 启动检查，如果是初次安装，则默认打开窗口
   * @private
   */
  private async openForTheFirstTime() {
    const { workspace } = this.app;

    const leaves = workspace.getLeavesOfType(Calendar_View);
    // 初次使用时，没有侧边栏按钮，则打开一个
    if (leaves.length == 0) {
      await this.activateView();
    }
  }

  onunload() {
    this.statusBarItemEl.remove();
    const { workspace } = this.app;
    const leaves = workspace.getLeavesOfType(Calendar_View);
    if (leaves.length > 0) {
      leaves[0].detach();
    }
  }

  async activateView() {
    const { workspace } = this.app;

    let leaf: WorkspaceLeaf | null;
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

  onFileOpen(file: TFile) {
    if (this.app.workspace.getActiveViewOfType(MarkdownView)) {
      this.debouncedUpdate(null, file.path);
    }
  }
}
