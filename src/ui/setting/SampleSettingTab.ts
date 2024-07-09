import { App, PluginSettingTab, Setting } from "obsidian";
import MyPlugin from "@/Index";

/**
 * 设置页面
 */
export class SampleSettingTab extends PluginSettingTab {
  plugin: MyPlugin;

  constructor(app: App, plugin: MyPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    new Setting(containerEl)
      .setName("设置统计数据保存地址")
      .setDesc("设置每日统计数据保存地址，如果为空，则保存在默认的插件目录下。建议使用 .json 的数据格式。" +
        "\n修改该配置后，需要重新加载插件。")
      .addText((text) =>
        text.setValue(this.plugin.settings.dataFile).onChange(async (value) => {
          this.plugin.settings.dataFile = value;
          await this.plugin.saveSettings();
        })
      );

    new Setting(containerEl)
      .setName("统计目录")
      .setDesc("设置需要统计数据的目录，如果为空，则统计全库的数据。")
      .addText((text) =>
        text
          .setPlaceholder("全部")
          .setValue(this.plugin.settings.statisticsFolder)
          .onChange(async (value) => {
            this.plugin.settings.statisticsFolder = value;
            await this.plugin.saveSettings();
          })
      );
    new Setting(containerEl)
      .setName("每日目标")
      .setDesc("设置每日目标。\n修改该配置后，需要重新加载插件。")
      .addText((text) =>
        text
          .setPlaceholder("1000")
          .setValue(this.plugin.settings.dailyTargetWordCount.toString())
          .onChange(async (value) => {
            try {
              // 转换为整数
              this.plugin.settings.dailyTargetWordCount = parseInt(value);
            } catch (e) {
              // 如果转换失败，则设置为默认值
              console.error("设置每日目标，数据不为数字", e);
            }
            await this.plugin.saveSettings();
          })
      );
  }
}

