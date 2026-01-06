import { Button, Dialog, Input, Transition } from '@headlessui/react';
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
import { Fragment, useEffect, useState } from 'react';
import {
  Hide,
  Quit,
  WindowIsMaximised,
  WindowMaximise,
  WindowUnmaximise,
} from '../../../wailsjs/runtime/runtime';
import { api } from '@/services/api';
import appIcon from '@/assets/appicon.svg';
import styles from '@/components/HeaderBar/HeaderBar.module.css';
import type { ThemeMode } from '@/hooks/useTheme';
import { useI18n } from '@/locales';

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
      await Hide();
    } catch {
      // Ignore errors from window control
    }
  };

  const handleClose = async () => {
    try {
      await Quit();
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
    <header className={styles.header}>
      <div className={styles.brand}>
        <span
          className={styles.logo}
          role="img"
          aria-label={t('app.logo')}
          style={{
            maskImage: `url(${appIcon})`,
            WebkitMaskImage: `url(${appIcon})`,
          }}
        />
        <h1>{title}</h1>
      </div>
      <div className={styles.actions}>
        <Button
          className={styles.ghost}
          aria-label={t('settings.title')}
          title={t('settings.title')}
          onClick={openSettings}
        >
          <FaCog />
        </Button>
        <div className={styles.windowControls}>
          <Button
            className={styles.windowButton}
            onClick={handleMinimise}
            aria-label={t('window.minimise')}
          >
            <FaWindowMinimize />
          </Button>
          <Button
            className={styles.windowButton}
            onClick={toggleMaximise}
            aria-label={t('window.maximise')}
          >
            {isMaximised ? <FaWindowRestore /> : <FaWindowMaximize />}
          </Button>
          <Button
            className={styles.windowButton}
            onClick={handleClose}
            aria-label={t('window.close')}
          >
            <FaTimes />
          </Button>
        </div>
      </div>
      <Transition show={isSettingsOpen} as={Fragment}>
        <Dialog onClose={() => setIsSettingsOpen(false)} className={styles.dialog}>
          <Transition.Child
            as={Fragment}
            enter={styles.menuEnter}
            enterFrom={styles.menuEnterFrom}
            enterTo={styles.menuEnterTo}
            leave={styles.menuLeave}
            leaveFrom={styles.menuLeaveFrom}
            leaveTo={styles.menuLeaveTo}
          >
            <div className={styles.overlay} />
          </Transition.Child>
          <div className={styles.dialogContainer}>
            <Transition.Child
              as={Fragment}
              enter={styles.menuEnter}
              enterFrom={styles.menuEnterFrom}
              enterTo={styles.menuEnterTo}
              leave={styles.menuLeave}
              leaveFrom={styles.menuLeaveFrom}
              leaveTo={styles.menuLeaveTo}
            >
              <Dialog.Panel className={styles.dialogPanel}>
                <Dialog.Title className={styles.dialogTitle}>{t('settings.title')}</Dialog.Title>
                <div className={styles.dialogBody}>
                  <div className={styles.themeRow}>
                    <div className={styles.settingGroup}>
                      <div className={styles.settingLabel}>
                        <FaAdjust /> {t('settings.theme')}
                      </div>
                      <div className={styles.themeButtons}>
                        <Button
                          className={`${styles.button} ${
                            theme === 'system' ? styles.themeButtonActive : ''
                          }`}
                          onClick={() => onSetTheme('system')}
                          aria-label={t('settings.themeSystem')}
                          title={t('settings.themeSystem')}
                        >
                          <FaAdjust />
                        </Button>
                        <Button
                          className={`${styles.button} ${
                            theme === 'light' ? styles.themeButtonActive : ''
                          }`}
                          onClick={() => onSetTheme('light')}
                          aria-label={t('settings.themeLight')}
                          title={t('settings.themeLight')}
                        >
                          <FaSun />
                        </Button>
                        <Button
                          className={`${styles.button} ${
                            theme === 'dark' ? styles.themeButtonActive : ''
                          }`}
                          onClick={() => onSetTheme('dark')}
                          aria-label={t('settings.themeDark')}
                          title={t('settings.themeDark')}
                        >
                          <FaMoon />
                        </Button>
                      </div>
                    </div>
                    <div className={styles.settingGroup}>
                      <div className={styles.settingLabel}>
                        <FaGlobe /> {t('settings.language')}
                      </div>
                      <div className={styles.themeButtons}>
                        <Button
                          className={`${styles.button} ${
                            locale === 'zh-CN' ? styles.themeButtonActive : ''
                          }`}
                          onClick={() => setLocale('zh-CN')}
                          aria-label={t('settings.langZh')}
                          title={t('settings.langZh')}
                        >
                          {t('settings.langZh')}
                        </Button>
                        <Button
                          className={`${styles.button} ${
                            locale === 'en' ? styles.themeButtonActive : ''
                          }`}
                          onClick={() => setLocale('en')}
                          aria-label={t('settings.langEn')}
                          title={t('settings.langEn')}
                        >
                          {t('settings.langEn')}
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className={styles.fieldRow}>
                    <Input
                      className={styles.input}
                      value={dirValue}
                      onChange={(event) => setDirValue(event.target.value)}
                      placeholder={t('settings.musicFolderPlaceholder')}
                    />
                    <Button
                      className={styles.button}
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
                      className={styles.button}
                      onClick={handlePickDir}
                      aria-label={t('settings.browseFolder')}
                      title={t('settings.browseFolder')}
                    >
                      <FaFolderOpen />
                    </Button>
                  </div>
                  <div className={styles.directoryList}>
                    {dirs.map((dir) => (
                      <div key={dir} className={styles.directoryItem}>
                        <span className={styles.directoryPath}>{dir}</span>
                        <Button
                          className={styles.button}
                          onClick={() => setDirs((prev) => prev.filter((item) => item !== dir))}
                          aria-label={t('settings.removeFolder')}
                          title={t('settings.removeFolder')}
                        >
                          <FaTrash />
                        </Button>
                      </div>
                    ))}
                    {!dirs.length && (
                      <div className={styles.hint}>{t('settings.usingDefault')}</div>
                    )}
                  </div>
                  <div className={styles.hint}>{t('settings.defaultHint')}</div>
                  <div className={styles.actionsRow}>
                    <Button
                      className={styles.button}
                      onClick={handleRefresh}
                      aria-label={t('settings.refresh')}
                      title={t('settings.refresh')}
                    >
                      <FaSyncAlt className={isRefreshing ? styles.spin : undefined} />
                    </Button>
                    <div className={styles.actionsGroup}>
                      <Button className={styles.button} onClick={handleReset}>
                        {t('settings.useDefault')}
                      </Button>
                      <Button
                        className={styles.button}
                        onClick={handleSave}
                        aria-label={t('settings.save')}
                        title={t('settings.save')}
                      >
                        <FaSave />
                      </Button>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </header>
  );
}
