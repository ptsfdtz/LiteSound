import { Listbox, Transition } from '@headlessui/react';
import { Fragment, type ReactElement, type ReactNode } from 'react';
import styles from '@/components/common/Dropdown/Dropdown.module.css';

type DropdownProps<T> = {
  value?: T;
  onChange: (value: T) => void;
  options: T[];
  getOptionLabel: (option: T) => string;
  buttonLabel: string;
  selectedLabel?: string;
  getOptionMeta?: (option: T) => ReactNode;
  getOptionKey?: (option: T) => string;
  className?: string;
  renderOption?: (option: T, state: { active: boolean; selected: boolean }) => ReactElement;
};

export function Dropdown<T>(props: DropdownProps<T>) {
  const {
    value,
    onChange,
    options,
    getOptionLabel,
    buttonLabel,
    selectedLabel,
    getOptionMeta,
    getOptionKey,
    className,
    renderOption,
  } = props;

  const compare = getOptionKey
    ? (a: T | null | undefined, b: T | null | undefined) => {
        if (!a || !b) return false;
        return getOptionKey(a) === getOptionKey(b);
      }
    : undefined;

  const safeValue = value ?? undefined;

  return (
    <div className={className ? `${styles.container} ${className}` : styles.container}>
      <Listbox value={safeValue} onChange={onChange} by={compare}>
        <Listbox.Button className={styles.trigger}>{buttonLabel}</Listbox.Button>
        <Transition
          as={Fragment}
          enter={styles.menuEnter}
          enterFrom={styles.menuEnterFrom}
          enterTo={styles.menuEnterTo}
          leave={styles.menuLeave}
          leaveFrom={styles.menuLeaveFrom}
          leaveTo={styles.menuLeaveTo}
        >
          <Listbox.Options className={styles.options}>
            {options.map((option) => (
              <Listbox.Option
                key={getOptionKey ? getOptionKey(option) : getOptionLabel(option)}
                value={option}
              >
                {({ active, selected }) => {
                  if (renderOption) {
                    return renderOption(option, { active, selected });
                  }
                  const meta = getOptionMeta ? getOptionMeta(option) : undefined;
                  return (
                    <div className={active ? `${styles.row} ${styles.rowActive}` : styles.row}>
                      <span>{getOptionLabel(option)}</span>
                      {selected && selectedLabel ? (
                        <span className={styles.selected}>{selectedLabel}</span>
                      ) : meta != undefined ? (
                        <span className={styles.meta}>{meta}</span>
                      ) : null}
                    </div>
                  );
                }}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </Listbox>
    </div>
  );
}
