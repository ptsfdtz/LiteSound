import { Button, Checkbox, Dialog, Input, Listbox, Transition } from '@headlessui/react';
import { FaPlus, FaPen, FaTrash } from 'react-icons/fa';
import { Fragment, useEffect, useMemo, useState } from 'react';
import type { MusicFile, Playlist } from '@/types/media';
import styles from '@/components/PlaylistSidebar/PlaylistSidebar.module.css';
import { useI18n } from '@/locales';

type PlaylistSidebarProps = {
  playlists: Playlist[];
  activePlaylist?: Playlist;
  onSelectPlaylist: (playlist?: Playlist) => void;
  onCreatePlaylist: (name: string) => void;
  onDeletePlaylist: (name: string) => void;
  onAddTracks: (playlistName: string, trackPaths: string[]) => void;
  files: MusicFile[];
  status: string;
  totalTracks: number;
};

export function PlaylistSidebar(props: PlaylistSidebarProps) {
  const {
    playlists,
    activePlaylist,
    onSelectPlaylist,
    onCreatePlaylist,
    onDeletePlaylist,
    onAddTracks,
    files,
    status,
    totalTracks,
  } = props;
  const { t } = useI18n();

  const allFilter = '__all__';
  const unknownFilter = '__unknown__';

  const [isOpen, setIsOpen] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | undefined>(activePlaylist);
  const [selectedTracks, setSelectedTracks] = useState<Record<string, boolean>>({});
  const [mode, setMode] = useState<'create' | 'edit'>('create');
  const [deleteTarget, setDeleteTarget] = useState<Playlist | null>(null);
  const [composerFilter, setComposerFilter] = useState(allFilter);
  const [albumFilter, setAlbumFilter] = useState(allFilter);

  useEffect(() => {
    setSelectedPlaylist(activePlaylist);
  }, [activePlaylist]);

  const selectedCount = useMemo(
    () => Object.values(selectedTracks).filter(Boolean).length,
    [selectedTracks],
  );

  const composerOptions = useMemo(() => {
    const set = new Set<string>();
    files.forEach((file) => {
      const value = file.composer?.trim() ? file.composer.trim() : unknownFilter;
      set.add(value);
    });
    return [
      { value: allFilter, label: t('filters.all') },
      ...Array.from(set)
        .sort((a, b) => a.localeCompare(b))
        .map((value) => ({
          value,
          label: value === unknownFilter ? t('filters.unknown') : value,
        })),
    ];
  }, [files, t]);

  const albumOptions = useMemo(() => {
    const set = new Set<string>();
    files.forEach((file) => {
      const value = file.album?.trim() ? file.album.trim() : unknownFilter;
      set.add(value);
    });
    return [
      { value: allFilter, label: t('filters.all') },
      ...Array.from(set)
        .sort((a, b) => a.localeCompare(b))
        .map((value) => ({
          value,
          label: value === unknownFilter ? t('filters.unknown') : value,
        })),
    ];
  }, [files, t]);

  const filteredFiles = useMemo(() => {
    return files.filter((file) => {
      const composerValue = file.composer?.trim() ? file.composer.trim() : unknownFilter;
      const albumValue = file.album?.trim() ? file.album.trim() : unknownFilter;
      const composerMatch = composerFilter === allFilter || composerFilter === composerValue;
      const albumMatch = albumFilter === allFilter || albumFilter === albumValue;
      return composerMatch && albumMatch;
    });
  }, [albumFilter, composerFilter, files]);

  const getFilterLabel = (value: string, options: { value: string; label: string }[]) => {
    const match = options.find((option) => option.value === value);
    return match ? match.label : t('filters.all');
  };

  const toggleTrack = (path: string, defaultChecked: boolean) => {
    setSelectedTracks((prev) => {
      const current = prev[path];
      const resolved = current ?? defaultChecked;
      return { ...prev, [path]: !resolved };
    });
  };

  const handleCreate = () => {
    if (!newPlaylistName.trim()) return;
    const created = newPlaylistName.trim();
    onCreatePlaylist(created);
    const nextPlaylist = { name: created, tracks: [] };
    setSelectedPlaylist(nextPlaylist);
    onSelectPlaylist(nextPlaylist);
    setNewPlaylistName('');
  };

  const handleEdit = (playlist: Playlist) => {
    setSelectedPlaylist(playlist);
    onSelectPlaylist(playlist);
    setSelectedTracks({});
    setComposerFilter(allFilter);
    setAlbumFilter(allFilter);
    setMode('edit');
    setIsOpen(true);
  };

  const handleDelete = (playlist: Playlist) => {
    setDeleteTarget(playlist);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    onDeletePlaylist(deleteTarget.name);
    setDeleteTarget(null);
  };

  const handleAdd = () => {
    if (!selectedPlaylist) return;
    const existing = new Set(selectedPlaylist.tracks);
    const paths = Object.entries(selectedTracks)
      .filter(([, checked]) => checked)
      .map(([path]) => path)
      .filter((path) => !existing.has(path));
    onAddTracks(selectedPlaylist.name, paths);
    setSelectedTracks({});
    setIsOpen(false);
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <div className={styles.title}>{t('playlist.title')}</div>
        <Button
          className={styles.button}
          onClick={() => {
            setMode('create');
            setComposerFilter(allFilter);
            setAlbumFilter(allFilter);
            setIsOpen(true);
          }}
          aria-label={t('playlist.addTo')}
        >
          <FaPlus />
        </Button>
      </div>
      <div className={styles.list}>
        <div
          className={!activePlaylist ? `${styles.item} ${styles.itemActive}` : styles.item}
          onClick={() => onSelectPlaylist(undefined)}
        >
          <span>{t('playlist.allTracks')}</span>
          <span className={styles.itemCount}>{totalTracks}</span>
        </div>
        {playlists.map((playlist) => (
          <div
            key={playlist.name}
            className={
              activePlaylist?.name === playlist.name
                ? `${styles.item} ${styles.itemActive}`
                : styles.item
            }
            onClick={() => onSelectPlaylist(playlist)}
          >
            <span>{playlist.name}</span>
            <span className={styles.itemActions}>
              <Button
                className={`${styles.button} ${styles.editButton}`}
                onClick={(event) => {
                  event.stopPropagation();
                  handleEdit(playlist);
                }}
                aria-label={t('playlist.editWithName', { name: playlist.name })}
                title={t('playlist.editWithName', { name: playlist.name })}
              >
                <FaPen />
              </Button>
              <Button
                className={`${styles.button} ${styles.deleteButton}`}
                onClick={(event) => {
                  event.stopPropagation();
                  handleDelete(playlist);
                }}
                aria-label={t('playlist.deleteWithName', { name: playlist.name })}
                title={t('playlist.deleteWithName', { name: playlist.name })}
              >
                <FaTrash />
              </Button>
              <span className={styles.itemCount}>{playlist.tracks.length}</span>
            </span>
          </div>
        ))}
        {!playlists.length && <div>{t('playlist.noPlaylists')}</div>}
      </div>

      <Transition show={isOpen} as={Fragment}>
        <Dialog onClose={() => setIsOpen(false)} className={styles.dialog}>
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
                <Dialog.Title className={styles.dialogTitle}>
                  {mode === 'edit' ? t('playlist.edit') : t('playlist.addTo')}
                </Dialog.Title>
                <div className={styles.dialogBody}>
                  {mode === 'create' && (
                    <div className={styles.fieldRow}>
                      <Input
                        className={styles.input}
                        placeholder={t('playlist.newNamePlaceholder')}
                        value={newPlaylistName}
                        onChange={(event) => setNewPlaylistName(event.target.value)}
                      />
                      <Button className={styles.button} onClick={handleCreate}>
                        {t('playlist.create')}
                      </Button>
                      <Listbox value={selectedPlaylist} onChange={setSelectedPlaylist} by="name">
                        <div className={styles.listbox}>
                          <Listbox.Button className={styles.button}>
                            {selectedPlaylist
                              ? t('playlist.label', { name: selectedPlaylist.name })
                              : t('playlist.selectPlaylist')}
                          </Listbox.Button>
                          <Listbox.Options className={styles.dialogList}>
                            {playlists.map((playlist) => (
                              <Listbox.Option key={playlist.name} value={playlist}>
                                {({ active: optionActive }) => (
                                  <div
                                    className={
                                      optionActive
                                        ? `${styles.item} ${styles.itemActive}`
                                        : styles.item
                                    }
                                  >
                                    <span>{playlist.name}</span>
                                    <span>{playlist.tracks.length}</span>
                                  </div>
                                )}
                              </Listbox.Option>
                            ))}
                          </Listbox.Options>
                        </div>
                      </Listbox>
                    </div>
                  )}
                  {mode === 'edit' && (
                    <div className={styles.filterRow}>
                      <Listbox value={composerFilter} onChange={setComposerFilter}>
                        <div className={styles.listbox}>
                          <Listbox.Button className={styles.button}>
                            {t('filters.composer')}:{' '}
                            {getFilterLabel(composerFilter, composerOptions)}
                          </Listbox.Button>
                          <Listbox.Options className={styles.dialogList}>
                            {composerOptions.map((option) => (
                              <Listbox.Option key={option.value} value={option.value}>
                                {({ active: optionActive }) => (
                                  <div
                                    className={
                                      optionActive
                                        ? `${styles.item} ${styles.itemActive}`
                                        : styles.item
                                    }
                                  >
                                    <span>{option.label}</span>
                                  </div>
                                )}
                              </Listbox.Option>
                            ))}
                          </Listbox.Options>
                        </div>
                      </Listbox>
                      <Listbox value={albumFilter} onChange={setAlbumFilter}>
                        <div className={styles.listbox}>
                          <Listbox.Button className={styles.button}>
                            {t('filters.album')}: {getFilterLabel(albumFilter, albumOptions)}
                          </Listbox.Button>
                          <Listbox.Options className={styles.dialogList}>
                            {albumOptions.map((option) => (
                              <Listbox.Option key={option.value} value={option.value}>
                                {({ active: optionActive }) => (
                                  <div
                                    className={
                                      optionActive
                                        ? `${styles.item} ${styles.itemActive}`
                                        : styles.item
                                    }
                                  >
                                    <span>{option.label}</span>
                                  </div>
                                )}
                              </Listbox.Option>
                            ))}
                          </Listbox.Options>
                        </div>
                      </Listbox>
                    </div>
                  )}

                  <div className={styles.trackList}>
                    {filteredFiles.map((file) => {
                      const alreadyInPlaylist = Boolean(
                        selectedPlaylist?.tracks.includes(file.path),
                      );
                      const isChecked = selectedTracks[file.path] ?? alreadyInPlaylist;
                      return (
                        <div key={file.path} className={styles.trackRow}>
                          <span>{file.name}</span>
                          <Checkbox
                            className={styles.checkbox}
                            checked={isChecked}
                            onChange={() => toggleTrack(file.path, alreadyInPlaylist)}
                          >
                            <span className={styles.checkboxMark} />
                          </Checkbox>
                        </div>
                      );
                    })}
                  </div>
                  {status && <div className={styles.status}>{status}</div>}
                  <div className={styles.actions}>
                    <Button className={styles.button} onClick={() => setIsOpen(false)}>
                      {t('playlist.cancel')}
                    </Button>
                    <Button
                      className={styles.button}
                      onClick={handleAdd}
                      disabled={!selectedPlaylist || selectedCount === 0}
                    >
                      {selectedCount
                        ? t('playlist.addCount', { count: selectedCount })
                        : t('playlist.add')}
                    </Button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>

      <Transition show={Boolean(deleteTarget)} as={Fragment}>
        <Dialog onClose={() => setDeleteTarget(null)} className={styles.dialog}>
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
                <Dialog.Title className={styles.dialogTitle}>{t('playlist.delete')}</Dialog.Title>
                <div className={styles.dialogBody}>
                  <div className={styles.status}>
                    {deleteTarget ? t('playlist.confirmDelete', { name: deleteTarget.name }) : ''}
                  </div>
                  <div className={styles.actions}>
                    <Button className={styles.button} onClick={() => setDeleteTarget(null)}>
                      {t('playlist.cancel')}
                    </Button>
                    <Button className={styles.button} onClick={confirmDelete}>
                      {t('playlist.delete')}
                    </Button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </aside>
  );
}
