import { Button, Listbox } from '@headlessui/react';
import { FaHeart, FaRegHeart, FaTimes } from 'react-icons/fa';
import { useMemo } from 'react';
import type { MusicFile } from '@/types/media';
import styles from '@/components/TrackList/TrackList.module.css';
import { useI18n } from '@/locales';

type TrackListProps = {
  files: MusicFile[];
  active?: MusicFile;
  favoritePaths: string[];
  playlistName?: string;
  onToggleFavorite: (path: string) => void;
  onRemoveFromPlaylist: (playlistName: string, path: string) => void;
  onSelect: (file?: MusicFile) => void;
};

export function TrackList(props: TrackListProps) {
  const {
    files,
    active,
    favoritePaths,
    playlistName,
    onToggleFavorite,
    onRemoveFromPlaylist,
    onSelect,
  } = props;
  const { t } = useI18n();
  const favoriteSet = useMemo(() => new Set(favoritePaths), [favoritePaths]);
  const favoritesKey = '__favorites__';
  const showRemove = Boolean(playlistName && playlistName !== favoritesKey);

  return (
    <aside className={styles.list}>
      <Listbox value={active} by="path" onChange={onSelect}>
        <Listbox.Options className={styles.options} static>
          {files.map((file) => {
            const isFavorite = favoriteSet.has(file.path);
            return (
              <Listbox.Option key={file.path} value={file}>
                {({ selected }) => (
                  <div className={selected ? `${styles.track} ${styles.active}` : styles.track}>
                    <span className={styles.name}>{file.name}</span>
                    <span className={styles.meta}>
                      {showRemove && (
                        <Button
                          className={styles.removeButton}
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            onRemoveFromPlaylist(playlistName || '', file.path);
                          }}
                          aria-label={t('track.removeFromPlaylist')}
                        >
                          <FaTimes />
                        </Button>
                      )}
                      <Button
                        className={
                          isFavorite
                            ? `${styles.favoriteButton} ${styles.favoriteActive}`
                            : styles.favoriteButton
                        }
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          onToggleFavorite(file.path);
                        }}
                        aria-label={isFavorite ? t('track.unfavorite') : t('track.favorite')}
                      >
                        {isFavorite ? <FaHeart /> : <FaRegHeart />}
                      </Button>
                      <span className={styles.ext}>{selected ? t('track.playing') : file.ext}</span>
                    </span>
                  </div>
                )}
              </Listbox.Option>
            );
          })}
          {!files.length && <div className={styles.empty}>No tracks match the filters.</div>}
        </Listbox.Options>
      </Listbox>
    </aside>
  );
}
