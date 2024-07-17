import { type IconName, ItemView, WorkspaceLeaf } from "obsidian";
import { createApp, type App as VueApp } from "vue";
import Calendar from "@/ui/calendar/Calendar.vue";
import store from "@/data/Store";
import DailyStatisticsPlugin from "@/Index";
import moment from "moment";
import {
  DailyStatisticsData,
  DailyStatisticsDataManagerInstance,
  type DailyStatisticsDataSaveListener
} from "@/data/StatisticsDataManager";
import zhCn from "element-plus/es/locale/lang/zh-cn";
import en from "element-plus/es/locale/lang/en";
import ElementPlus from "element-plus";
import { i18nG } from "@/globals";


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


  dailyStatisticsDataSaveListenerImpl = new class DailyStatisticsDataSaveListenerImpl
    implements DailyStatisticsDataSaveListener {
    onSave(data: DailyStatisticsData): void {
      // // console.info("DailyStatisticsDataSaveListenerImpl-CalendarView onSave");
      store.commit("updateStatisticsData", data.dayCounts);
    }

    getListenerId(): string {
      return "DailyStatisticsDataSaveListenerImpl-CalendarView";
    }
  };

  async onOpen() {


    // 初始化数据
    const yearMon = moment().format("YYYY-MM");
    store.commit("updateMonth", yearMon);
    store.commit("updateStatisticsData", DailyStatisticsDataManagerInstance.data.dayCounts);
    store.commit("updateTargetWordCont", this.plugin.settings.dailyTargetWordCount);

    // 创建并挂在组件
    const _app = createApp(Calendar);
    _app.config.globalProperties.$t = i18nG.instance;
    _app.use(store);
    _app.use(ElementPlus, {
      locale: this.plugin.settings.language == "zh-cn" ? zhCn : en
    });
    _app.mount(this.containerEl);
    this._vueApp = _app;


    // 当有数据更新时，更新日历视图
    DailyStatisticsDataManagerInstance.addDataSaveListener(this.dailyStatisticsDataSaveListenerImpl);

    const today = moment().format("YYYY-MM-DD");
    this.intervalId = setInterval(() => {
      // console.info("检查日期是否为当天……");
      // 检查日期是否为当天，如果不是，则重新创建视图
      if (moment().format("YYYY-MM-DD") !== today) {
        // console.info("日期更新，重置视图");
        this.onClose();
        this.onOpen();
      }
    }, 1000 * 60 * 60);
    // }, 1000);
  }



  async onClose() {
    // // console.info("CalendarView onClose");
    if (this._vueApp) {
      this._vueApp.unmount();
    }
    this.containerEl.empty();

    DailyStatisticsDataManagerInstance.removeDataSaveListener(this.dailyStatisticsDataSaveListenerImpl);
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null; // 重置定时器 ID
    }

  }

}


