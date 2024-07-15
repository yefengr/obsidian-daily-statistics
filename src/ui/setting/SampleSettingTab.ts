import { App, PluginSettingTab, Setting } from "obsidian";
import DailyStatisticsPlugin from "@/Index";
import i18n from "simplest-i18n";

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

    const t = i18n({
      locale: this.plugin.settings.language,
      locales: [
        "zh-cn",
        "en"
      ]
    });

    containerEl.empty();

    new Setting(containerEl)
      .setName(t("语言", "Language"))
      .setDesc(t("设置页面语言。", "Set the page language. "))
      .addDropdown((dropdown) => {
        dropdown
          .addOption("zh-cn", "中文")
          .addOption("en", "English")
          .setValue(this.plugin.settings.language)
          .onChange(async (value) => {
            this.plugin.settings.language = value;
            await this.plugin.saveSettings();
            this.display();
            await this.plugin.languageChange();
          });
      });

    new Setting(containerEl)
      .setName(t("统计数据保存地址", "Statistics data saving address"))
      .setDesc(t("设置每日统计数据保存地址，如果为空，则保存在默认的插件目录下。建议使用 .json 的数据格式。修改该配置后，需要重新加载插件。",
        "Set the daily statistical data saving address. If it is empty, it will be saved in the default plug-in directory. It is recommended to use the .json data format. After modifying this configuration, you need to reload the plugin."))
      .addText((text) =>
        text.setValue(this.plugin.settings.dataFile).onChange(async (value) => {
          this.plugin.settings.dataFile = value;
          await this.plugin.saveSettings();
        })
      );

    new Setting(containerEl)
      .setName(t("统计目录", "Statistics catalog"))
      .setDesc(t("设置需要统计数据的目录，如果为空，则统计全库的数据。", "Set the directory to be counted. If it is empty, all data in the library will be counted."))
      .addText((text) =>
        text
          .setPlaceholder(t("全部", "All"))
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

