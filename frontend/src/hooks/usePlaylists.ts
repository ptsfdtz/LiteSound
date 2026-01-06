import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import type { Playlist } from '@/types/media';
import { useI18n } from '@/locales';

export function usePlaylists() {
  const { t } = useI18n();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [activePlaylist, setActivePlaylist] = useState<Playlist | undefined>(undefined);
  const [playlistStatus, setPlaylistStatus] = useState('');

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
    void refreshPlaylists();
  }, []);

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
    setActivePlaylist,
    playlistStatus,
    refreshPlaylists,
    createPlaylist,
    addTracksToPlaylist,
  };
}
