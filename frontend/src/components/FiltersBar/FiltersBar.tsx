import { Listbox, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import styles from '@/components/FiltersBar/FiltersBar.module.css';

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

  return (
    <div className={styles.filters}>
      <div className={styles.item}>
        <Listbox value={composerFilter} onChange={onComposerChange}>
          <Listbox.Button className={styles.trigger}>Composer: {composerFilter}</Listbox.Button>
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
                      <span>{name}</span>
                      {selected && <span className={styles.selected}>selected</span>}
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
          <Listbox.Button className={styles.trigger}>Album: {albumFilter}</Listbox.Button>
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
                      <span>{name}</span>
                      {selected && <span className={styles.selected}>selected</span>}
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
