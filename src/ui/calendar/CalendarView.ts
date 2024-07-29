import { type IconName, ItemView, WorkspaceLeaf } from "obsidian";
import { createApp, type App as VueApp } from "vue";
import store from "@/data/Store";
import DailyStatisticsPlugin from "@/Index";
import moment from "moment";
import {
  DailyStatisticsData,
  DailyStatisticsDataManagerInstance,
  type DailyStatisticsDataSaveListener
} from "@/data/StatisticsDataManager";
import zhCn from "element-plus/es/locale/lang/zh-cn";
import dayjs from "dayjs";
import "dayjs/locale/zh-cn";
import en from "element-plus/es/locale/lang/en";
import ElementPlus from "element-plus";
import i18n from "@/lang/index"; // 多语言引入
import VueIndex from "@/ui/calendar/VueIndex.vue";


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
    return "Daily statistics";
  }

  getIcon(): IconName {
    return "calendar-with-checkmark";
  }


  dailyStatisticsDataSaveListenerImpl = new class DailyStatisticsDataSaveListenerImpl
    implements DailyStatisticsDataSaveListener {
    onSave(data: DailyStatisticsData): void {
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
    store.commit("updateWeeklyPlan", DailyStatisticsDataManagerInstance.data.weeklyPlan);

    const locale = i18n.global.locale.value;
    if (locale == "zh_cn") {
      dayjs.locale("zh-cn");
    }


    // 创建并挂在组件
    const _app = createApp(VueIndex);
    _app.config.globalProperties.$t = i18n.global.t;
    _app.use(store);
    _app.use(i18n);
    _app.use(ElementPlus, {
      locale: locale == "zh_cn" ? zhCn : en
    });
    _app.mount(this.containerEl);
    this._vueApp = _app;


    // 当有数据更新时，更新日历视图
    DailyStatisticsDataManagerInstance.addDataSaveListener(this.dailyStatisticsDataSaveListenerImpl);

    const today = moment().format("YYYY-MM-DD");
    this.intervalId = setInterval(() => {
      // // console.log("检查日期是否为当天……");
      // 检查日期是否为当天，如果不是，则重新创建视图
      if (moment().format("YYYY-MM-DD") !== today) {
        // // console.log("日期更新，重置视图");
        this.onClose();
        this.onOpen();
      }
    }, 1000 * 60 * 60);
    // }, 1000);
  }


  async onClose() {
    // // // console.log("CalendarView onClose");
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


