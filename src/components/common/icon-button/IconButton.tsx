import { ReactNode } from 'react';
import clsx from 'clsx';
import styles from './IconButton.module.css';

type IconButtonProps = {
  ariaLabel: string;
  onClick: () => void;
  children: ReactNode;
  size?: 'sm' | 'md';
  variant?: 'default' | 'close';
};

function IconButton({ ariaLabel, onClick, children, size = 'md', variant = 'default' }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className={clsx(styles.iconButton, styles[size], variant === 'close' && styles.close)}
    >
      {children}
    </button>
  );
}

export default IconButton;
