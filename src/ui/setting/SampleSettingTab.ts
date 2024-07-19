import { App, PluginSettingTab, Setting } from "obsidian";
import DailyStatisticsPlugin from "@/Index";
import i18n from "@/lang";

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
    // new Setting(containerEl)
    //   .setName("每日目标")
    //   .setDesc("设置每日目标。修改该配置后，需要重新加载插件。")
    //   .addText((text) =>
    //     text
    //       .setPlaceholder("1000")
    //       .setValue(this.plugin.settings.dailyTargetWordCount.toString())
    //       .onChange(async (value) => {
    //         try {
    //           // 转换为整数
    //           this.plugin.settings.dailyTargetWordCount = parseInt(value);
    //         } catch (e) {
    //           // 如果转换失败，则设置为默认值
    //           console.error("设置每日目标，数据不为数字", e);
    //         }
    //         await this.plugin.saveSettings();
    //       })
    //   );
  }
}

