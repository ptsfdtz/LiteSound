import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import type { Playlist } from '@/types/media';
import { useI18n } from '@/locales';
import { toast } from 'sonner';

export function usePlaylists() {
  const { t } = useI18n();
  const favoritesKey = '__favorites__';
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [activePlaylist, setActivePlaylist] = useState<Playlist | undefined>(undefined);
  const [playlistStatus, setPlaylistStatus] = useState('');

  const favorites = playlists.find((playlist) => playlist.name === favoritesKey);
  const favoritePaths = favorites ? favorites.tracks : [];

  const initPlaylists = async () => {
    try {
      const [list, saved] = await Promise.all([api.getPlaylists(), api.getActivePlaylist()]);
      setPlaylists(list);
      const match = saved ? list.find((playlist) => playlist.name === saved) : undefined;
      setActivePlaylist(match);
    } catch (err: any) {
      const message = err?.message ?? t('playlistStatus.failedRefresh');
      setPlaylistStatus(message);
      toast.error(message);
    }
  };

  const refreshPlaylists = async () => {
    try {
      const list = await api.getPlaylists();
      setPlaylists(list);
      if (activePlaylist) {
        const match = list.find((playlist) => playlist.name === activePlaylist.name);
        setActivePlaylist(match);
      }
    } catch (err: any) {
      const message = err?.message ?? t('playlistStatus.failedRefresh');
      setPlaylistStatus(message);
      toast.error(message);
    }
  };

  useEffect(() => {
    void initPlaylists();
  }, []);

  const selectPlaylist = async (playlist?: Playlist) => {
    setActivePlaylist(playlist);
    try {
      await api.setActivePlaylist(playlist?.name ?? '');
    } catch (err: any) {
      setPlaylistStatus(err?.message ?? t('playlistStatus.failedRefresh'));
    }
  };

  const createPlaylist = async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) {
      return;
    }
    try {
      await api.createPlaylist(trimmed);
      const message = t('playlistStatus.created');
      setPlaylistStatus(message);
      toast.success(message);
      await refreshPlaylists();
    } catch (err: any) {
      const message = err?.message ?? t('playlistStatus.failedCreate');
      setPlaylistStatus(message);
      toast.error(message);
    }
  };

  const deletePlaylist = async (name: string) => {
    if (!name) return;
    try {
      await api.deletePlaylist(name);
      if (activePlaylist?.name === name) {
        setActivePlaylist(undefined);
        await api.setActivePlaylist('');
      }
      const message = t('playlistStatus.deleted');
      setPlaylistStatus(message);
      toast.success(message);
      await refreshPlaylists();
    } catch (err: any) {
      const message = err?.message ?? t('playlistStatus.failedDelete');
      setPlaylistStatus(message);
      toast.error(message);
    }
  };

  const toggleFavorite = async (path: string) => {
    if (!path) return;
    const isFavorite = favoritePaths.includes(path);
    try {
      if (isFavorite) {
        await api.removeFromPlaylist(favoritesKey, path);
        const message = t('playlistStatus.unfavorited');
        setPlaylistStatus(message);
        toast.success(message);
      } else {
        await api.addToPlaylist(favoritesKey, path);
        const message = t('playlistStatus.favorited');
        setPlaylistStatus(message);
        toast.success(message);
      }
      await refreshPlaylists();
    } catch (err: any) {
      const message = err?.message ?? t('playlistStatus.failedFavorite');
      setPlaylistStatus(message);
      toast.error(message);
    }
  };

  const removeTrackFromPlaylist = async (playlistName: string, path: string) => {
    if (!playlistName || !path) return;
    try {
      await api.removeFromPlaylist(playlistName, path);
      const message = t('playlistStatus.removed');
      setPlaylistStatus(message);
      toast.success(message);
      await refreshPlaylists();
    } catch (err: any) {
      const message = err?.message ?? t('playlistStatus.failedRemove');
      setPlaylistStatus(message);
      toast.error(message);
    }
  };

  const addTracksToPlaylist = async (playlistName: string, trackPaths: string[]) => {
    if (!playlistName || !trackPaths.length) {
      const message = t('playlistStatus.selectPrompt');
      setPlaylistStatus(message);
      toast.info(message);
      return;
    }
    try {
      for (const path of trackPaths) {
        await api.addToPlaylist(playlistName, path);
      }
      await refreshPlaylists();
    } catch (err: any) {
      const message = err?.message ?? t('playlistStatus.failedAdd');
      setPlaylistStatus(message);
      toast.error(message);
    }
  };

  return {
    playlists,
    activePlaylist,
    selectPlaylist,
    playlistStatus,
    refreshPlaylists,
    createPlaylist,
    deletePlaylist,
    addTracksToPlaylist,
    removeTrackFromPlaylist,
    favoritePaths,
    toggleFavorite,
  };
}
