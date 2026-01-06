import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { translations } from './config';
import type { Locale, TranslationKey } from './config';

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const saved = window.localStorage.getItem('litesound.locale');
    if (saved === 'zh-CN' || saved === 'en') {
      return saved;
    }
    return navigator.language.toLowerCase().startsWith('zh') ? 'zh-CN' : 'en';
  });

  useEffect(() => {
    window.localStorage.setItem('litesound.locale', locale);
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
  }, []);

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>) => {
      const dict = translations[locale] ?? translations.en;
      let value: string = dict[key] ?? translations.en[key] ?? key;
      if (params) {
        Object.entries(params).forEach(([name, paramValue]) => {
          value = value.replaceAll(`{${name}}`, String(paramValue));
        });
      }
      return value;
    },
    [locale],
  );

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}
