import { useEffect, useMemo, useState } from 'react';
import { api } from '@/services/api';

export type ThemeMode = 'system' | 'light' | 'dark';

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeMode>('system');
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    let mounted = true;
    api
      .getTheme()
      .then((value) => {
        if (!mounted) return;
        if (value === 'light' || value === 'dark' || value === 'system') {
          setThemeState(value);
        } else {
          setThemeState('system');
        }
      })
      .catch(() => {
        if (!mounted) return;
        setThemeState('system');
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const update = () => setSystemTheme(media.matches ? 'dark' : 'light');
    update();
    if (media.addEventListener) {
      media.addEventListener('change', update);
      return () => media.removeEventListener('change', update);
    }
    media.addListener(update);
    return () => media.removeListener(update);
  }, []);

  const effectiveTheme = useMemo(
    () => (theme === 'system' ? systemTheme : theme),
    [theme, systemTheme],
  );

  useEffect(() => {
    const apply = () => {
      document.documentElement.dataset.theme = effectiveTheme;
    };
    if ('startViewTransition' in document) {
      document.startViewTransition(() => apply());
    } else {
      apply();
    }
  }, [effectiveTheme]);

  const setTheme = async (next: ThemeMode) => {
    setThemeState(next);
    try {
      await api.setTheme(next);
    } catch {
      // Ignore theme persistence errors
    }
  };

  return {
    theme,
    effectiveTheme,
    setTheme,
  };
}
