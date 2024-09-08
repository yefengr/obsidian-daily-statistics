import { App, PluginSettingTab, Setting } from "obsidian";
import DailyStatisticsPlugin from "@/Index";
import i18n from "@/lang";
import { DailyStatisticsDataManagerInstance } from "@/data/StatisticsDataManager";

/**
 * 设置页面
 */
export class SampleSettingTab extends PluginSettingTab {
  plugin: DailyStatisticsPlugin;

  constructor(app: App, plugin: DailyStatisticsPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    const t = i18n.global.t;
    containerEl.empty();

    new Setting(containerEl)
      .setName(t("statisticalDataStorageAddress"))
      .setDesc(t("statisticalDataStorageAddressExplained"))
      .addText((text) =>
        text.setValue(this.plugin.settings.dataFile).onChange(async (value) => {
          this.plugin.settings.dataFile = value;
          await this.plugin.saveSettings();
        })
      );

    new Setting(containerEl)
      .setName(t("statisticsCatalog"))
      .setDesc(t("statisticsCatalogExplained"))
      .addText((text) =>
        text
          .setPlaceholder(t("all"))
          .setValue(this.plugin.settings.statisticsFolder)
          .onChange(async (value) => {
            this.plugin.settings.statisticsFolder = value;
            await this.plugin.saveSettings();
          })
      );
    new Setting(containerEl)
      .setName(t("statisticsWord"))
      .setDesc(t("statisticsWordExplained"))
      .addToggle((component) =>
        component
          .setValue(this.plugin.settings.statisticsWord)
          .onChange(async (value) => {
            this.plugin.settings.statisticsWord = value;
            await this.plugin.saveSettings();
            // 将当日的统计数据重置
            DailyStatisticsDataManagerInstance.resetCurrentDayStatistics()
          })
      );
  }
}
