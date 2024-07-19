import { createI18n, useI18n } from "vue-i18n"; // 引入i18n创建多语言对象
import zhCnLocale from "./zh-cn"; // 引入中文对应语言配置
import enLocale from "./en"; // 引入英文对应语言配置
import { moment } from "obsidian";


const messages = {
  zh_cn: zhCnLocale,
  en: enLocale
};
let locale = moment.locale();
// console.log("locale is " + locale);

if (locale === "zh_cn" || locale === "zh-cn" || locale === "zh") {
  locale = "zh_cn";
} else {
  locale = "en";
}

const i18n = createI18n({
  globalInjection: true, // 开启全局多语言渗透
  locale: locale, // 语言环境
  messages, // 语言配置字段
  legacy: false // // 使用 vue3 组合式API 时必须设置为 false
});

export default i18n;


