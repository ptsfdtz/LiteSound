import { Button, Checkbox, Dialog, Input, Listbox, Transition } from '@headlessui/react';
import { FaPlus, FaPen } from 'react-icons/fa';
import { Fragment, useEffect, useMemo, useState } from 'react';
import type { MusicFile, Playlist } from '@/types/media';
import styles from '@/components/PlaylistSidebar/PlaylistSidebar.module.css';

type PlaylistSidebarProps = {
  playlists: Playlist[];
  activePlaylist?: Playlist;
  onSelectPlaylist: (playlist?: Playlist) => void;
  onCreatePlaylist: (name: string) => void;
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
    onAddTracks,
    files,
    status,
    totalTracks,
  } = props;

  const [isOpen, setIsOpen] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | undefined>(activePlaylist);
  const [selectedTracks, setSelectedTracks] = useState<Record<string, boolean>>({});
  const [mode, setMode] = useState<'create' | 'edit'>('create');

  useEffect(() => {
    setSelectedPlaylist(activePlaylist);
  }, [activePlaylist]);

  const selectedCount = useMemo(
    () => Object.values(selectedTracks).filter(Boolean).length,
    [selectedTracks],
  );

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
    setMode('edit');
    setIsOpen(true);
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
        <div className={styles.title}>Playlist</div>
        <Button
          className={styles.button}
          onClick={() => {
            setMode('create');
            setIsOpen(true);
          }}
          aria-label="Add playlist"
        >
          <FaPlus />
        </Button>
      </div>
      <div className={styles.list}>
        <div
          className={!activePlaylist ? `${styles.item} ${styles.itemActive}` : styles.item}
          onClick={() => onSelectPlaylist(undefined)}
        >
          <span>All tracks</span>
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
                aria-label={`Edit ${playlist.name}`}
              >
                <FaPen />
              </Button>
              <span className={styles.itemCount}>{playlist.tracks.length}</span>
            </span>
          </div>
        ))}
        {!playlists.length && <div>No playlists.</div>}
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
                  {mode === 'edit' ? 'Edit playlist' : 'Add to playlist'}
                </Dialog.Title>
                <div className={styles.dialogBody}>
                  {mode === 'create' && (
                    <div className={styles.fieldRow}>
                      <Input
                        className={styles.input}
                        placeholder="New playlist name"
                        value={newPlaylistName}
                        onChange={(event) => setNewPlaylistName(event.target.value)}
                      />
                      <Button className={styles.button} onClick={handleCreate}>
                        Create
                      </Button>
                    </div>
                  )}
                  <div className={styles.fieldRow}>
                    <Listbox value={selectedPlaylist} onChange={setSelectedPlaylist} by="name">
                      <div className={styles.listbox}>
                        <Listbox.Button className={styles.button}>
                          {selectedPlaylist ? selectedPlaylist.name : 'Select playlist'}
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
                  <div className={styles.trackList}>
                    {files.map((file) => {
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
                      Cancel
                    </Button>
                    <Button
                      className={styles.button}
                      onClick={handleAdd}
                      disabled={!selectedPlaylist || selectedCount === 0}
                    >
                      Add {selectedCount ? `(${selectedCount})` : ''}
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
