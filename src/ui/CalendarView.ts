import { ItemView, WorkspaceLeaf } from "obsidian";
import { createApp, type App as VueApp } from "vue";
import Calendar from "@/ui/Calendar.vue";
import store from "@/store";
import MyPlugin from "@/starterIndex";
import moment from "moment";


export const VIEW_TYPE_EXAMPLE = "example-view";

export class CalendarView extends ItemView {

  _vueApp: VueApp | undefined;
  intervalId: number | null = null;

  plugin: MyPlugin;

  constructor(leaf: WorkspaceLeaf, plugin: MyPlugin) {
    super(leaf);
    this.plugin = plugin;
  }

  getViewType() {
    return VIEW_TYPE_EXAMPLE;
  }

  getDisplayText() {
    return "CalendarView";
  }

  async onOpen() {
    // const container = this.containerEl.children[1];
    // container.empty();
    // container.createEl("h4", { text: "Example view" });
    console.info("CalendarView onOpen");


    // 先设置时间为当月
    const yearMon = moment().format("YYYY-MM");
    store.commit("updateMonth", yearMon);
    // 存储数据
    this.updateData();

    // 设置目标字数
    store.commit("updateTargetWordCont", this.plugin.settings.dailyTargetWordCount);

    // 创建并挂在组件
    const _app = createApp(Calendar);
    _app.use(store);
    _app.mount(this.containerEl);
    this._vueApp = _app;

    // 定时更新数据
    this.intervalId = setInterval(() => {
      this.updateData();
    }, 1000);
  }


  private updateData() {
    try {
      // console.info("CalendarView updateData ");
      // const data = this.plugin.statisticsDataManager.getByMonth(store.state.month);
      const dayCounts = this.plugin.statisticsDataManager.data.dayCounts;
      store.commit("updateStatisticsData", dayCounts);
    } catch (error) {
      console.error("CalendarView updateData error", error);
    }
  }

  async onClose() {

    console.info("CalendarView onClose");
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

  onload() {
    super.onload();
    console.info("CalendarView onload");
  }

  onunload() {
    super.onunload();
    console.info("CalendarView onunload");
  }
}
