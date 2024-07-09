import { App, Plugin, TFile } from "obsidian";
import { DailyStatisticsSettings } from "./Settting";
import moment from "moment";

export interface WordCount {
  initial: number;
  current: number;
}

export class DailyStatisticsData {
  dayCounts: Record<string, number> = {};
  todayWordCount: Record<string, WordCount> = {};
}

export class DailyStatisticsDataManager {
  filePath = "";
  file!: TFile | null;
  today!: string;
  currentWordCount!: number;

  app: App;
  data: DailyStatisticsData;
  plugin: Plugin;

  constructor(dataFile: string, app: App, plugin: Plugin) {
    this.filePath = dataFile;
    this.app = app;
    this.plugin = plugin;
    // 给一个默认值，避免出错
    this.data = new DailyStatisticsData();
  }

  // 加载数据
  async loadStatisticsData() {
    console.info("loadStatisticsData, dataFile is " + this.filePath);

    // 如果配置文件为空，则从默认的设置中加载杜
    if (this.filePath == null || this.filePath == "") {
      this.data = Object.assign(
        new DailyStatisticsData(),
        await this.plugin.loadData()
      );
      // 移除配置相关的属性
      this.removeProperties(this.data, new DailyStatisticsSettings());
    } else {
      // 循环5次
      for (let i = 0; i < 5; i++) {
        this.file = this.app.vault.getFileByPath(this.filePath);
        if (this.file != null) {
          console.info("dataFile ready");
          break;
        }
        console.info("waiting for dataFile…… ");
        // 等待3秒
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
      this.file = this.app.vault.getFileByPath(this.filePath);
      if (this.file == null) {
        console.info("create dataFile " + this.filePath);
        this.file = await this.app.vault.create(
          this.filePath,
          JSON.stringify(new DailyStatisticsData())
        );
      }
      this.data = JSON.parse(await this.app.vault.read(this.file));
    }

    this.updateDate();
    if (Object.prototype.hasOwnProperty.call(this.data.dayCounts, this.today)) {
      this.updateCounts();
    } else {
      this.currentWordCount = 0;
    }
  }

  removeProperties(
    obj: Record<string, any>,
    propsToRemove: Record<string, any>
  ): void {
    // 获取要删除属性的名称数组
    const keysToRemove = Object.keys(propsToRemove);

    // 遍历要删除的属性名称，并从原始对象中删除它们
    keysToRemove.forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        delete obj[key];
      }
    });
  }

  // 保存数据
  async saveStatisticsData() {
    try {
      // console.info("saveStatisticsData…………");

      this.updateDate();
      if (this.filePath != null && this.filePath != "") {
        // console.info("saveStatisticsData, dataFile is " + this.filePath);
        if (this.file == null) {
          this.file = await this.app.vault.create(
            this.filePath,
            JSON.stringify(this.data)
          );
        }
        await this.app.vault.modify(this.file, JSON.stringify(this.data));
      } else {
        // console.info("saveStatisticsData, save data in setting");
        let data = await this.plugin.loadData();
        // console.info("saveStatisticsData, data is " + JSON.stringify(data));
        if (data == null) {
          data = {};
        }
        Object.assign(data, this.data);
        await this.plugin.saveData(data);
      }
    } catch (error) {
      console.error("保存统计数据出错：", error);
    }
  }

  getWordCount(text: string) {
    return text.length;
  }

  updateWordCount(contents: string, filepath: string) {
    const curr = this.getWordCount(contents);
    if (Object.prototype.hasOwnProperty.call(this.data.dayCounts, this.today)) {
      if (
        Object.prototype.hasOwnProperty.call(this.data.todayWordCount, filepath)
      ) {
        //updating existing file
        this.data.todayWordCount[filepath].current = curr;
      } else {
        //created new file during session
        this.data.todayWordCount[filepath] = { initial: curr, current: curr };
      }
    } else {
      //new day, flush the cache
      this.data.todayWordCount = {};
      this.data.todayWordCount[filepath] = { initial: curr, current: curr };
    }
    this.updateCounts();
    this.saveStatisticsData().then(r => {
      console.info("saveStatisticsData, save data");
    });

  }

  updateDate() {
    this.today = moment().format("YYYY-MM-DD");
    // console.info("updateDate, today is " + this.today)
  }

  updateCounts() {
    this.currentWordCount = Object.values(this.data.todayWordCount)
      .map((wordCount) => Math.max(0, wordCount.current - wordCount.initial))
      .reduce((a, b) => a + b, 0);
    this.data.dayCounts[this.today] = this.currentWordCount;
  }


}
