import { FaHeart, FaRegHeart, FaTimes } from 'react-icons/fa';
import { useMemo } from 'react';
import type { MusicFile } from '@/types/media';
import { useI18n } from '@/locales';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
    <aside className="flex max-h-[calc(100vh-180px)] flex-col gap-2 overflow-auto rounded-2xl border border-border bg-card p-4 shadow-[0_16px_32px_var(--panel-glow)] max-[900px]:max-h-none">
      <div role="listbox" className="flex flex-col gap-2">
        {files.map((file) => {
          const isFavorite = favoriteSet.has(file.path);
          const isActive = active?.path === file.path;
          return (
            <div
              key={file.path}
              role="option"
              aria-selected={isActive}
              tabIndex={0}
              className={cn(
                'group flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl border border-transparent px-3 py-2 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                isActive ? 'border-primary bg-secondary' : 'hover:border-border hover:bg-secondary',
              )}
              onClick={() => onSelect(file)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onSelect(file);
                }
              }}
            >
              <span className="text-sm leading-snug">{file.name}</span>
              <span className="flex items-center gap-2">
                {showRemove && (
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-7 w-7 rounded-md opacity-0 transition-opacity pointer-events-none group-hover:pointer-events-auto group-hover:opacity-100"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      onRemoveFromPlaylist(playlistName || '', file.path);
                    }}
                    aria-label={t('track.removeFromPlaylist')}
                  >
                    <FaTimes className="h-3 w-3" />
                  </Button>
                )}
                <Button
                  variant="secondary"
                  size="icon"
                  className={cn(
                    'h-7 w-7 rounded-md opacity-0 transition-opacity pointer-events-none group-hover:pointer-events-auto group-hover:opacity-100',
                    isFavorite && 'text-primary',
                  )}
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    onToggleFavorite(file.path);
                  }}
                  aria-label={isFavorite ? t('track.unfavorite') : t('track.favorite')}
                >
                  {isFavorite ? (
                    <FaHeart className="h-3 w-3" />
                  ) : (
                    <FaRegHeart className="h-3 w-3" />
                  )}
                </Button>
                <span className="text-xs text-muted-foreground">
                  {isActive ? t('track.playing') : file.ext}
                </span>
              </span>
            </div>
          );
        })}
        {!files.length && (
          <div className="px-3 py-2 text-sm text-muted-foreground">
            No tracks match the filters.
          </div>
        )}
      </div>
    </aside>
  );
}
