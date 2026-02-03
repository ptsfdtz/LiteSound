import {
  FaAdjust,
  FaCog,
  FaFolderOpen,
  FaGlobe,
  FaMoon,
  FaPlus,
  FaSave,
  FaSun,
  FaSyncAlt,
  FaTimes,
  FaTrash,
  FaWindowMaximize,
  FaWindowMinimize,
  FaWindowRestore,
} from 'react-icons/fa';
import { useEffect, useState, type CSSProperties } from 'react';
import {
  Hide,
  WindowIsMaximised,
  WindowMaximise,
  WindowMinimise,
  WindowUnmaximise,
} from '../../../wailsjs/runtime/runtime';
import { api } from '@/services/api';
import appIcon from '@/assets/appicon.svg';
import type { ThemeMode } from '@/hooks/useTheme';
import { useI18n } from '@/locales';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type HeaderBarProps = {
  title: string;
  onRefresh: () => void;
  musicDir: string;
  musicDirs: string[];
  onSetMusicDirs: (paths: string[]) => void;
  theme: ThemeMode;
  onSetTheme: (theme: ThemeMode) => void;
};

export function HeaderBar(props: HeaderBarProps) {
  const { title, onRefresh, musicDir, musicDirs, onSetMusicDirs, theme, onSetTheme } = props;
  const { locale, setLocale, t } = useI18n();
  const [isMaximised, setIsMaximised] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [dirValue, setDirValue] = useState(musicDir);
  const [dirs, setDirs] = useState<string[]>(musicDirs);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    let mounted = true;
    const syncState = async () => {
      try {
        const maxed = await WindowIsMaximised();
        if (mounted) {
          setIsMaximised(maxed);
        }
      } catch {
        if (mounted) {
          setIsMaximised(false);
        }
      }
    };
    void syncState();
    return () => {
      mounted = false;
    };
  }, []);

  const toggleMaximise = async () => {
    try {
      const maxed = await WindowIsMaximised();
      if (maxed) {
        await WindowUnmaximise();
        setIsMaximised(false);
      } else {
        await WindowMaximise();
        setIsMaximised(true);
      }
    } catch {
      // Ignore errors from window control
    }
  };

  const handleMinimise = async () => {
    try {
      await WindowMinimise();
    } catch {
      // Ignore errors from window control
    }
  };

  const handleClose = async () => {
    try {
      await Hide();
    } catch {
      // Ignore errors from window control
    }
  };

  const openSettings = () => {
    setDirValue(musicDir);
    setDirs(musicDirs);
    setIsSettingsOpen(true);
  };

  const addDir = (path: string) => {
    const trimmed = path.trim();
    if (!trimmed) {
      return;
    }
    setDirs((prev) => {
      if (prev.some((dir) => dir === trimmed)) {
        return prev;
      }
      return [...prev, trimmed];
    });
  };

  const handlePickDir = async () => {
    try {
      const fallback = dirs[dirs.length - 1] || dirValue || musicDir;
      const picked = await api.pickMusicDir(fallback);
      if (picked) {
        addDir(picked);
        setDirValue('');
      }
    } catch {
      // Ignore dialog errors
    }
  };

  const handleSave = () => {
    const pending = dirValue.trim();
    const combined = pending ? [...dirs, pending] : dirs;
    const cleaned = combined.map((dir) => dir.trim()).filter(Boolean);
    onSetMusicDirs(cleaned);
    setIsSettingsOpen(false);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.resolve(onRefresh());
    } finally {
      setTimeout(() => setIsRefreshing(false), 600);
    }
  };

  const handleReset = () => {
    onSetMusicDirs([]);
    setIsSettingsOpen(false);
  };

  return (
    <header
      className="flex min-h-[48px] items-center justify-between gap-4"
      style={{ '--wails-draggable': 'drag' } as CSSProperties}
    >
      <div className="flex items-center gap-3">
        <span
          className="h-8 w-8 bg-[var(--app-text)]"
          role="img"
          aria-label={t('app.logo')}
          style={{
            maskImage: `url(${appIcon})`,
            WebkitMaskImage: `url(${appIcon})`,
            maskRepeat: 'no-repeat',
            WebkitMaskRepeat: 'no-repeat',
            maskSize: 'contain',
            WebkitMaskSize: 'contain',
            maskPosition: 'center',
            WebkitMaskPosition: 'center',
          }}
        />
        <h1 className="mb-[3px] text-[28px] tracking-[0.5px]">{title}</h1>
      </div>
      <div
        className="flex items-center gap-3"
        style={{ '--wails-draggable': 'no-drag' } as CSSProperties}
      >
        <Button
          variant="secondary"
          size="icon"
          className="h-9 w-9 rounded-[10px]"
          aria-label={t('settings.title')}
          title={t('settings.title')}
          onClick={openSettings}
        >
          <FaCog />
        </Button>
        <div
          className="inline-flex items-center gap-2"
          style={{ '--wails-draggable': 'no-drag' } as CSSProperties}
        >
          <Button
            variant="secondary"
            size="icon"
            className="h-9 w-9 rounded-[10px]"
            onClick={handleMinimise}
            aria-label={t('window.minimise')}
          >
            <FaWindowMinimize />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="h-9 w-9 rounded-[10px]"
            onClick={toggleMaximise}
            aria-label={t('window.maximise')}
          >
            {isMaximised ? <FaWindowRestore /> : <FaWindowMaximize />}
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="h-9 w-9 rounded-[10px]"
            onClick={handleClose}
            aria-label={t('window.close')}
          >
            <FaTimes />
          </Button>
        </div>
      </div>

      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="max-w-[560px] rounded-[18px] border border-border bg-card p-5 shadow-[0_20px_40px_var(--panel-glow)]">
          <DialogHeader>
            <DialogTitle>{t('settings.title')}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FaAdjust /> {t('settings.theme')}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="icon"
                    className={cn(
                      'h-9 w-9 rounded-[10px]',
                      theme === 'system' && 'border-primary text-primary',
                    )}
                    onClick={() => onSetTheme('system')}
                    aria-label={t('settings.themeSystem')}
                    title={t('settings.themeSystem')}
                  >
                    <FaAdjust />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className={cn(
                      'h-9 w-9 rounded-[10px]',
                      theme === 'light' && 'border-primary text-primary',
                    )}
                    onClick={() => onSetTheme('light')}
                    aria-label={t('settings.themeLight')}
                    title={t('settings.themeLight')}
                  >
                    <FaSun />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className={cn(
                      'h-9 w-9 rounded-[10px]',
                      theme === 'dark' && 'border-primary text-primary',
                    )}
                    onClick={() => onSetTheme('dark')}
                    aria-label={t('settings.themeDark')}
                    title={t('settings.themeDark')}
                  >
                    <FaMoon />
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FaGlobe /> {t('settings.language')}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className={cn(
                      'rounded-[10px] px-3',
                      locale === 'zh-CN' && 'border-primary text-primary',
                    )}
                    onClick={() => setLocale('zh-CN')}
                    aria-label={t('settings.langZh')}
                    title={t('settings.langZh')}
                  >
                    {t('settings.langZh')}
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className={cn(
                      'rounded-[10px] px-3',
                      locale === 'en' && 'border-primary text-primary',
                    )}
                    onClick={() => setLocale('en')}
                    aria-label={t('settings.langEn')}
                    title={t('settings.langEn')}
                  >
                    {t('settings.langEn')}
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Input
                className="min-w-[220px] flex-1"
                value={dirValue}
                onChange={(event) => setDirValue(event.target.value)}
                placeholder={t('settings.musicFolderPlaceholder')}
              />
              <Button
                variant="secondary"
                size="icon"
                className="h-9 w-9 rounded-[10px]"
                onClick={() => {
                  addDir(dirValue);
                  setDirValue('');
                }}
                aria-label={t('settings.addFolder')}
                title={t('settings.addFolder')}
              >
                <FaPlus />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="h-9 w-9 rounded-[10px]"
                onClick={handlePickDir}
                aria-label={t('settings.browseFolder')}
                title={t('settings.browseFolder')}
              >
                <FaFolderOpen />
              </Button>
            </div>
            <div className="flex max-h-40 flex-col gap-2 overflow-auto">
              {dirs.map((dir) => (
                <div key={dir} className="flex items-center justify-between gap-2">
                  <span className="flex-1 break-all rounded-xl border border-border px-3 py-2 text-xs text-muted-foreground">
                    {dir}
                  </span>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8 rounded-[10px]"
                    onClick={() => setDirs((prev) => prev.filter((item) => item !== dir))}
                    aria-label={t('settings.removeFolder')}
                    title={t('settings.removeFolder')}
                  >
                    <FaTrash />
                  </Button>
                </div>
              ))}
              {!dirs.length && (
                <div className="text-xs text-muted-foreground">{t('settings.usingDefault')}</div>
              )}
            </div>
            <div className="text-xs text-muted-foreground">{t('settings.defaultHint')}</div>
            <div className="flex items-center justify-between gap-2">
              <Button
                variant="secondary"
                size="icon"
                className="h-9 w-9 rounded-[10px]"
                onClick={handleRefresh}
                aria-label={t('settings.refresh')}
                title={t('settings.refresh')}
              >
                <FaSyncAlt className={cn(isRefreshing && 'animate-spin')} />
              </Button>
              <div className="flex items-center gap-2">
                <Button variant="secondary" onClick={handleReset}>
                  {t('settings.useDefault')}
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-9 w-9 rounded-[10px]"
                  onClick={handleSave}
                  aria-label={t('settings.save')}
                  title={t('settings.save')}
                >
                  <FaSave />
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}
