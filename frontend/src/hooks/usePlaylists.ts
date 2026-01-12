import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import type { Playlist } from '@/types/media';
import { useI18n } from '@/locales';

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
      setPlaylistStatus(err?.message ?? t('playlistStatus.failedRefresh'));
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
      setPlaylistStatus(err?.message ?? t('playlistStatus.failedRefresh'));
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
      setPlaylistStatus(t('playlistStatus.nameRequired'));
      return;
    }
    try {
      await api.createPlaylist(trimmed);
      setPlaylistStatus(t('playlistStatus.created'));
      await refreshPlaylists();
    } catch (err: any) {
      setPlaylistStatus(err?.message ?? t('playlistStatus.failedCreate'));
    }
  };

  const deletePlaylist = async (name: string) => {
    if (!name) return;
    try {
      await api.deletePlaylist(name);
      setPlaylistStatus(t('playlistStatus.deleted'));
      if (activePlaylist?.name === name) {
        setActivePlaylist(undefined);
        await api.setActivePlaylist('');
      }
      await refreshPlaylists();
    } catch (err: any) {
      setPlaylistStatus(err?.message ?? t('playlistStatus.failedDelete'));
    }
  };

  const toggleFavorite = async (path: string) => {
    if (!path) return;
    const isFavorite = favoritePaths.includes(path);
    try {
      if (isFavorite) {
        await api.removeFromPlaylist(favoritesKey, path);
        setPlaylistStatus(t('playlistStatus.unfavorited'));
      }
      await refreshPlaylists();
    } catch (err: any) {
      setPlaylistStatus(err?.message ?? t('playlistStatus.failedFavorite'));
    }
  };

  const addTracksToPlaylist = async (playlistName: string, trackPaths: string[]) => {
    if (!playlistName || !trackPaths.length) {
      setPlaylistStatus(t('playlistStatus.selectPrompt'));
      return;
    }
    try {
      for (const path of trackPaths) {
        await api.addToPlaylist(playlistName, path);
      }
      setPlaylistStatus(t('playlistStatus.added'));
      await refreshPlaylists();
    } catch (err: any) {
      setPlaylistStatus(err?.message ?? t('playlistStatus.failedAdd'));
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
    favoritePaths,
    toggleFavorite,
  };
}
