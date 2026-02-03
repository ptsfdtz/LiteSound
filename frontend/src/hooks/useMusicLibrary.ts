import { useEffect, useMemo, useState } from 'react';
import { api } from '@/services/api';
import type { MusicFile } from '@/types/media';
import { useI18n } from '@/locales';
import { toast } from 'sonner';

export function useMusicLibrary() {
  const { t } = useI18n();
  const [musicDir, setMusicDir] = useState('');
  const [musicDirs, setMusicDirs] = useState<string[]>([]);
  const [files, setFiles] = useState<MusicFile[]>([]);
  const [status, setStatus] = useState(t('status.loading'));
  const [composerFilter, setComposerFilter] = useState('All');
  const [albumFilter, setAlbumFilter] = useState('All');
  const [trackQuery, setTrackQuery] = useState('');
  const [lastPlayedPath, setLastPlayedPath] = useState('');
  const [lastPlayedAt, setLastPlayedAt] = useState(0);

  useEffect(() => {
    let mounted = true;
    Promise.all([api.getMusicDirs(), api.listMusicFiles(), api.getLastPlayedRecord(), api.getFilters()])
      .then(([dirs, list, lastPlayed, filters]) => {
        if (!mounted) return;
        setMusicDirs(dirs);
        setMusicDir(dirs[0] ?? '');
        setFiles(list);
        setStatus(list.length ? t('status.ready') : t('status.noFiles'));
        setLastPlayedPath(lastPlayed?.path || '');
        setLastPlayedAt(lastPlayed?.playedAt || 0);
        const [savedComposer, savedAlbum] = filters ?? [];
        if (savedComposer) {
          setComposerFilter(savedComposer);
        }
        if (savedAlbum) {
          setAlbumFilter(savedAlbum);
        }
      })
      .catch((err) => {
        if (!mounted) return;
        const message = err?.message ?? t('status.failedLoad');
        setStatus(message);
        toast.error(message);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    void api.setFilters(composerFilter, albumFilter);
  }, [composerFilter, albumFilter]);

  const refresh = async () => {
    setStatus(t('status.loading'));
    try {
      const list = await api.listMusicFiles();
      setFiles(list);
      setStatus(list.length ? t('status.ready') : t('status.noFiles'));
    } catch (err: any) {
      const message = err?.message ?? t('status.failedRefresh');
      setStatus(message);
      toast.error(message);
    }
  };

  const updateMusicDirs = async (paths: string[]) => {
    setStatus(t('status.updatingDir'));
    try {
      const nextDirs = await api.setMusicDirs(paths);
      setMusicDirs(nextDirs);
      setMusicDir(nextDirs[0] ?? '');
      await refresh();
    } catch (err: any) {
      const message = err?.message ?? t('status.failedUpdateDir');
      setStatus(message);
      toast.error(message);
    }
  };

  const composers = useMemo(() => {
    const set = new Set<string>();
    files.forEach((file) => {
      const name = file.composer?.trim() || 'Unknown';
      set.add(name);
    });
    return ['All', ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [files]);

  const albums = useMemo(() => {
    const set = new Set<string>();
    files.forEach((file) => {
      const name = file.album?.trim() || 'Unknown';
      set.add(name);
    });
    return ['All', ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [files]);

  const filteredFiles = useMemo(() => {
    const query = trackQuery.trim().toLowerCase();
    return files.filter((file) => {
      const composer = file.composer?.trim() || 'Unknown';
      const album = file.album?.trim() || 'Unknown';
      if (composerFilter !== 'All' && composer !== composerFilter) {
        return false;
      }
      if (albumFilter !== 'All' && album !== albumFilter) {
        return false;
      }
      if (query && !file.name.toLowerCase().includes(query)) {
        return false;
      }
      return true;
    });
  }, [files, composerFilter, albumFilter, trackQuery]);

  return {
    musicDir,
    musicDirs,
    files,
    status,
    setStatus,
    composerFilter,
    setComposerFilter,
    albumFilter,
    setAlbumFilter,
    trackQuery,
    setTrackQuery,
    lastPlayedPath,
    updateMusicDirs,
    refresh,
    composers,
    albums,
    filteredFiles,
    lastPlayedAt,
  };
}
