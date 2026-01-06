import { Listbox, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import styles from '@/components/FiltersBar/FiltersBar.module.css';
import { useI18n } from '@/locales';

type FiltersBarProps = {
  composers: string[];
  composerFilter: string;
  onComposerChange: (value: string) => void;
  albums: string[];
  albumFilter: string;
  onAlbumChange: (value: string) => void;
};

export function FiltersBar(props: FiltersBarProps) {
  const { composers, composerFilter, onComposerChange, albums, albumFilter, onAlbumChange } = props;
  const { t } = useI18n();

  const renderFilterLabel = (value: string) => {
    if (value === 'All') return t('filters.all');
    if (value === 'Unknown') return t('filters.unknown');
    return value;
  };

  return (
    <div className={styles.filters}>
      <div className={styles.item}>
        <Listbox value={composerFilter} onChange={onComposerChange}>
          <Listbox.Button className={styles.trigger}>
            {t('filters.composer')}: {renderFilterLabel(composerFilter)}
          </Listbox.Button>
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
              {composers.map((name) => (
                <Listbox.Option key={name} value={name}>
                  {({ active: optionActive, selected }) => (
                    <div
                      className={optionActive ? `${styles.row} ${styles.rowActive}` : styles.row}
                    >
                      <span>{renderFilterLabel(name)}</span>
                      {selected && <span className={styles.selected}>{t('filters.selected')}</span>}
                    </div>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </Listbox>
      </div>
      <div className={styles.item}>
        <Listbox value={albumFilter} onChange={onAlbumChange}>
          <Listbox.Button className={styles.trigger}>
            {t('filters.album')}: {renderFilterLabel(albumFilter)}
          </Listbox.Button>
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
              {albums.map((name) => (
                <Listbox.Option key={name} value={name}>
                  {({ active: optionActive, selected }) => (
                    <div
                      className={optionActive ? `${styles.row} ${styles.rowActive}` : styles.row}
                    >
                      <span>{renderFilterLabel(name)}</span>
                      {selected && <span className={styles.selected}>{t('filters.selected')}</span>}
                    </div>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </Listbox>
      </div>
    </div>
  );
}
