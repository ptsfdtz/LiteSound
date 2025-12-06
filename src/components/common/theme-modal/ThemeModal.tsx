import styles from './ThemeModal.module.css';
import IconButton from '../icon-button/IconButton';

type ThemeOption = 'light' | 'dark';

type ThemeModalProps = {
  open: boolean;
  value: ThemeOption;
  onSelect: (value: ThemeOption) => void;
  onClose: () => void;
};

function ThemeModal({ open, value, onSelect, onClose }: ThemeModalProps) {
  if (!open) return null;

  const handleSelect = (theme: ThemeOption) => {
    onSelect(theme);
    onClose();
  };

  return (
    <div className={styles.overlay} data-tauri-drag-region="false">
      <div className={styles.modal} role="dialog" aria-modal="true" aria-label="Choose theme">
        <div className={styles.header}>
          <div className={styles.title}>Theme</div>
          <IconButton ariaLabel="Close theme dialog" onClick={onClose} size="sm">
            ×
          </IconButton>
        </div>
        <div className={styles.options}>
          <button
            type="button"
            className={`${styles.option} ${value === 'light' ? styles.active : ''}`}
            onClick={() => handleSelect('light')}
          >
            <span className={styles.dot} />
            <div>
              <div className={styles.optionTitle}>Light</div>
              <div className={styles.optionMeta}>Bright, airy surfaces</div>
            </div>
          </button>
          <button
            type="button"
            className={`${styles.option} ${value === 'dark' ? styles.active : ''}`}
            onClick={() => handleSelect('dark')}
          >
            <span className={styles.dot} />
            <div>
              <div className={styles.optionTitle}>Dark</div>
              <div className={styles.optionMeta}>Low-glare, high contrast</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ThemeModal;
