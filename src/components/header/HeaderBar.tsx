import { useEffect, useMemo, useState } from 'react';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { FiMinus, FiSquare, FiX, FiSettings } from 'react-icons/fi';
import IconButton from '../common/icon-button/IconButton';
import styles from './HeaderBar.module.css';

type HeaderBarProps = {
  title: string;
  placeholder?: string;
  onSearch?: (value: string) => void;
  onOpenSettings?: () => void;
};

function HeaderBar({ title, placeholder = 'Search', onSearch, onOpenSettings }: HeaderBarProps) {
  const [isMaximized, setIsMaximized] = useState(false);
  const appWindow = useMemo(() => getCurrentWindow(), []);

  useEffect(() => {
    let mounted = true;
    appWindow
      .isMaximized()
      .then((state) => {
        if (mounted) setIsMaximized(state);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, [appWindow]);

  const handleToggleMaximize = async () => {
    try {
      const nextState = !(await appWindow.isMaximized());
      if (nextState) {
        await appWindow.maximize();
      } else {
        await appWindow.unmaximize();
      }
      setIsMaximized(nextState);
    } catch (error) {
      // swallow errors silently to avoid UI disruption
      console.error('Failed to toggle maximize state:', error);
    }
  };

  return (
    <div className={styles.headerBar} data-tauri-drag-region="true">
      <div className={styles.leftCluster}>
        <div className={styles.headerTitle}>{title}</div>
      </div>
      <div className={styles.search} data-tauri-drag-region="false">
        <input
          type="text"
          placeholder={placeholder}
          onChange={(e) => onSearch?.(e.target.value)}
          data-tauri-drag-region="false"
        />
      </div>
      <div className={styles.actions} data-tauri-drag-region="false">
        <IconButton ariaLabel="Settings" onClick={onOpenSettings ?? (() => {})} size="sm">
          <FiSettings size={16} />
        </IconButton>
        <div className={styles.windowControls} data-tauri-drag-region="false">
          <IconButton ariaLabel="Minimize" onClick={() => appWindow.minimize()} size="sm">
            <FiMinus size={16} />
          </IconButton>
          <IconButton ariaLabel={isMaximized ? 'Restore' : 'Maximize'} onClick={handleToggleMaximize} size="sm">
            <FiSquare size={16} />
          </IconButton>
          <IconButton ariaLabel="Close" onClick={() => appWindow.close()} size="sm" variant="close">
            <FiX size={16} />
          </IconButton>
        </div>
      </div>
    </div>
  );
}

export default HeaderBar;
