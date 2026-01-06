import en from './en';
import zhCN from './zh-CN';

export const translations = {
  en,
  'zh-CN': zhCN,
} as const;

export type Locale = keyof typeof translations;
export type TranslationKey = keyof (typeof translations)['en'];
