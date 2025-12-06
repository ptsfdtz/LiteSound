import { useEffect, useState } from 'react';
import type { Theme } from '../types';

/**
 * 主题管理 Hook
 * @param initialTheme 初始主题
 * @returns 当前主题和设置主题的函数
 */
export function useTheme(initialTheme: Theme = 'light') {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    return savedTheme || initialTheme;
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  return { theme, setTheme };
}
