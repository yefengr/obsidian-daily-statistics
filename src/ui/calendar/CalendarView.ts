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


    // 先设置时间为当月
    const yearMon = moment().format("YYYY-MM");
    store.commit("updateMonth", yearMon);
    // 存储数据
    store.commit("updateStatisticsData", this.plugin.statisticsDataManager.data.dayCounts);

    // 设置目标字数
    store.commit("updateTargetWordCont", this.plugin.settings.dailyTargetWordCount);

    // 创建并挂在组件
    const _app = createApp(Calendar);
    _app.use(store);
    _app.mount(this.containerEl);
    this._vueApp = _app;

    // 定时更新数据
    // this.intervalId = setInterval(() => {
    //   this.updateData();
    // }, 1000);

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
  }


  async onClose() {

    // console.info("CalendarView onClose");
    // Nothing to clean up.
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


