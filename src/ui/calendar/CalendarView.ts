import { type IconName, ItemView, WorkspaceLeaf } from "obsidian";
import { createApp, type App as VueApp } from "vue";
import Calendar from "@/ui/calendar/Calendar.vue";
import store from "@/data/Store";
import DailyStatisticsPlugin from "@/Index";
import moment from "moment";
import { DailyStatisticsData, type DailyStatisticsDataSaveListener } from "@/data/StatisticsDataManager";


export const Calendar_View = "CalendarView";

export class CalendarView extends ItemView {

  _vueApp: VueApp | undefined;
  intervalId: number | null = null;

  plugin: DailyStatisticsPlugin;

  constructor(leaf: WorkspaceLeaf, plugin: DailyStatisticsPlugin) {
    super(leaf);
    this.plugin = plugin;
  }

  getViewType() {
    return Calendar_View;
  }

  getDisplayText() {
    return "Daily Statistics";
  }

  getIcon(): IconName {
    return "calendar-with-checkmark";
  }

  async onOpen() {
    // const container = this.containerEl.children[1];
    // container.empty();
    // container.createEl("h4", { text: "Example view" });
    // console.info("CalendarView onOpen");


    // 初始化数据
    const yearMon = moment().format("YYYY-MM");
    store.commit("updateMonth", yearMon);
    store.commit("updateStatisticsData", this.plugin.statisticsDataManager.data.dayCounts);
    store.commit("updateTargetWordCont", this.plugin.settings.dailyTargetWordCount);

    // 创建并挂在组件
    const _app = createApp(Calendar);
    _app.use(store);
    _app.mount(this.containerEl);
    this._vueApp = _app;

    // 当有数据更新时，更新日历视图
    this.plugin.statisticsDataManager.addDataSaveListener(new class DailyStatisticsDataSaveListenerImpl
        implements DailyStatisticsDataSaveListener {
        onSave(data: DailyStatisticsData): void {
          // console.info("DailyStatisticsDataSaveListenerImpl-CalendarView onSave");
          store.commit("updateStatisticsData", data.dayCounts);
        }

        getListenerId(): string {
          return "DailyStatisticsDataSaveListenerImpl-CalendarView";
        }
      }
    );

    this.intervalId = setInterval(() => {
      console.info("检查日期是否为当天……");
      // 检查日期是否为当天，如果不是，则重新创建视图
      if (moment().format("YYYY-MM-DD") !== moment(this.plugin.statisticsDataManager.today).format("YYYY-MM-DD")) {
        console.info("日期更新，重置视图");
        this.onClose();
        this.onOpen();
      }
    }, 1000 * 60 * 60);
    // }, 1000);
  }


  async onClose() {

    // console.info("CalendarView onClose");
    if (this._vueApp) {
      this._vueApp.unmount();
    }
    this.containerEl.empty();
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null; // 重置定时器 ID
    }
  }

}


