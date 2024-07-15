// simplest-i18n.d.ts
declare module "simplest-i18n" {
  export interface I18nConfig {
    locale: string;
    locales: string[];
  }

  export interface I18n {
    (...contents: string[]): string;
  }

  export default function i18n(config: I18nConfig): I18n;
}
