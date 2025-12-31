import {Listbox} from '@headlessui/react';
import type {MusicFile} from '../../types/media';
import styles from './TrackList.module.css';

type TrackListProps = {
    files: MusicFile[];
    active?: MusicFile;
    onSelect: (file?: MusicFile) => void;
};

export function TrackList(props: TrackListProps) {
    const {files, active, onSelect} = props;
    return (
        <aside className={styles.list}>
            <Listbox value={active} by="path" onChange={onSelect}>
                <Listbox.Options className={styles.options} static>
                    {files.map((file) => (
                        <Listbox.Option key={file.path} value={file}>
                            {({selected}) => (
                                <div className={selected ? `${styles.track} ${styles.active}` : styles.track}>
                                    <span className={styles.name}>{file.name}</span>
                                    <span className={styles.ext}>{selected ? 'playing' : file.ext}</span>
                                </div>
                            )}
                        </Listbox.Option>
                    ))}
                    {!files.length && <div className={styles.empty}>No tracks match the filters.</div>}
                </Listbox.Options>
            </Listbox>
        </aside>
    );
}
