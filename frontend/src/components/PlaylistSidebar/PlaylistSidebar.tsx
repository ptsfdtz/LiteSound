import { FaPen, FaPlus, FaTrash } from 'react-icons/fa';
import { useEffect, useMemo, useState } from 'react';
import type { MusicFile, Playlist } from '@/types/media';
import { Dropdown } from '@/components/common/Dropdown/Dropdown';
import { useI18n } from '@/locales';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

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

  const favoritesPlaylistKey = '__favorites__';

  const getPlaylistLabel = (playlist?: Playlist) => {
    if (!playlist) return '';
    return playlist.name === favoritesPlaylistKey ? t('playlist.favorites') : playlist.name;
  };

  const isFavoritesPlaylist = (playlist?: Playlist) => playlist?.name === favoritesPlaylistKey;

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
    return [allFilter, ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [files]);

  const albumOptions = useMemo(() => {
    const set = new Set<string>();
    files.forEach((file) => {
      const value = file.album?.trim() ? file.album.trim() : unknownFilter;
      set.add(value);
    });
    return [allFilter, ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [files]);

  const filteredFiles = useMemo(() => {
    return files.filter((file) => {
      const composerValue = file.composer?.trim() ? file.composer.trim() : unknownFilter;
      const albumValue = file.album?.trim() ? file.album.trim() : unknownFilter;
      const composerMatch = composerFilter === allFilter || composerFilter === composerValue;
      const albumMatch = albumFilter === allFilter || albumFilter === albumValue;
      return composerMatch && albumMatch;
    });
  }, [albumFilter, composerFilter, files]);

  const renderFilterLabel = (value: string) => {
    if (value === allFilter) return t('filters.all');
    if (value === unknownFilter) return t('filters.unknown');
    return value;
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
    if (isFavoritesPlaylist(playlist)) return;
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
    <aside className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="ml-2 text-base font-semibold">{t('playlist.title')}</div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-[10px]"
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
      <div className="flex max-h-[400px] flex-col gap-2 overflow-auto px-1 py-2">
        <div
          className={cn(
            'flex cursor-pointer items-center justify-between gap-2 rounded-lg border border-transparent px-2.5 py-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            !activePlaylist && 'border-primary bg-secondary',
          )}
          onClick={() => onSelectPlaylist(undefined)}
          tabIndex={0}
          role="button"
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              onSelectPlaylist(undefined);
            }
          }}
        >
          <span>{t('playlist.allTracks')}</span>
          <span className="text-xs text-muted-foreground">{totalTracks}</span>
        </div>
        {playlists.map((playlist) => {
          const playlistLabel = getPlaylistLabel(playlist);
          const favorites = isFavoritesPlaylist(playlist);

          return (
            <div
              key={playlist.name}
              className={cn(
                'group flex cursor-pointer items-center justify-between gap-2 rounded-lg border border-transparent px-2.5 py-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                activePlaylist?.name === playlist.name && 'border-primary bg-secondary',
              )}
              onClick={() => onSelectPlaylist(playlist)}
              tabIndex={0}
              role="button"
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onSelectPlaylist(playlist);
                }
              }}
            >
              <span className="truncate">{playlistLabel}</span>
              <span className="flex items-center gap-1.5">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-md opacity-0 transition-opacity pointer-events-none group-hover:pointer-events-auto group-hover:opacity-100"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleEdit(playlist);
                  }}
                  aria-label={t('playlist.editWithName', { name: playlistLabel })}
                  title={t('playlist.editWithName', { name: playlistLabel })}
                >
                  <FaPen className="h-3 w-3" />
                </Button>
                {!favorites && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-md opacity-0 transition-opacity pointer-events-none group-hover:pointer-events-auto group-hover:opacity-100"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleDelete(playlist);
                    }}
                    aria-label={t('playlist.deleteWithName', { name: playlistLabel })}
                    title={t('playlist.deleteWithName', { name: playlistLabel })}
                  >
                    <FaTrash className="h-3 w-3" />
                  </Button>
                )}
                <span className="text-xs text-muted-foreground">{playlist.tracks.length}</span>
              </span>
            </div>
          );
        })}
        {!playlists.length && (
          <div className="text-sm text-muted-foreground">{t('playlist.noPlaylists')}</div>
        )}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-[600px] rounded-2xl border border-border bg-card p-4 shadow-[0_20px_40px_var(--panel-glow)]">
          <DialogHeader>
            <DialogTitle>{mode === 'edit' ? t('playlist.edit') : t('playlist.addTo')}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            {mode === 'create' && (
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Input
                    className="min-w-[220px] flex-1"
                    placeholder={t('playlist.newNamePlaceholder')}
                    value={newPlaylistName}
                    onChange={(event) => setNewPlaylistName(event.target.value)}
                  />
                  <Button
                    variant="secondary"
                    className="h-10 rounded-[10px]"
                    onClick={handleCreate}
                  >
                    {t('playlist.create')}
                  </Button>
                </div>
                <Dropdown
                  value={selectedPlaylist}
                  onChange={setSelectedPlaylist}
                  options={playlists}
                  getOptionLabel={getPlaylistLabel}
                  getOptionKey={(playlist) => playlist.name}
                  getOptionMeta={(playlist) => playlist.tracks.length}
                  buttonLabel={
                    selectedPlaylist
                      ? t('playlist.label', { name: getPlaylistLabel(selectedPlaylist) })
                      : t('playlist.selectPlaylist')
                  }
                  className="min-w-[220px]"
                />
              </div>
            )}
            {mode === 'edit' && (
              <div className="flex items-center gap-2">
                <Dropdown
                  value={composerFilter}
                  onChange={setComposerFilter}
                  options={composerOptions}
                  getOptionLabel={renderFilterLabel}
                  getOptionKey={(value) => value}
                  buttonLabel={`${t('filters.composer')}: ${renderFilterLabel(composerFilter)}`}
                  className="w-[240px]"
                />
                <Dropdown
                  value={albumFilter}
                  onChange={setAlbumFilter}
                  options={albumOptions}
                  getOptionLabel={renderFilterLabel}
                  getOptionKey={(value) => value}
                  buttonLabel={`${t('filters.album')}: ${renderFilterLabel(albumFilter)}`}
                  className="w-[240px]"
                />
              </div>
            )}

            <div className="flex h-[240px] flex-col gap-2 overflow-auto rounded-lg border border-border bg-card p-2">
              {filteredFiles.map((file) => {
                const alreadyInPlaylist = Boolean(selectedPlaylist?.tracks.includes(file.path));
                const isChecked = selectedTracks[file.path] ?? alreadyInPlaylist;
                return (
                  <div key={file.path} className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm">{file.name}</span>
                    <Checkbox
                      className="h-5 w-5"
                      checked={isChecked}
                      onCheckedChange={() => toggleTrack(file.path, alreadyInPlaylist)}
                    />
                  </div>
                );
              })}
            </div>
            {status && <div className="text-sm text-muted-foreground">{status}</div>}
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setIsOpen(false)}>
                {t('playlist.cancel')}
              </Button>
              <Button
                variant="default"
                onClick={handleAdd}
                disabled={!selectedPlaylist || selectedCount === 0}
              >
                {selectedCount
                  ? t('playlist.addCount', { count: selectedCount })
                  : t('playlist.add')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <DialogContent className="max-w-[480px] rounded-2xl border border-border bg-card p-4 shadow-[0_20px_40px_var(--panel-glow)]">
          <DialogHeader>
            <DialogTitle>{t('playlist.delete')}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="text-sm text-muted-foreground">
              {deleteTarget
                ? t('playlist.confirmDelete', { name: getPlaylistLabel(deleteTarget) })
                : ''}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
                {t('playlist.cancel')}
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                {t('playlist.delete')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </aside>
  );
}
