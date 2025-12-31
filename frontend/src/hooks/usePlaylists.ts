import {useEffect, useState} from 'react';
import {api} from '../services/api';
import type {Playlist} from '../types/media';

export function usePlaylists() {
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
            setPlaylistStatus(err?.message ?? 'Failed to refresh playlists.');
        }
    };

    useEffect(() => {
        void refreshPlaylists();
    }, []);

    const createPlaylist = async (name: string) => {
        const trimmed = name.trim();
        if (!trimmed) {
            setPlaylistStatus('Playlist name is required.');
            return;
        }
        try {
            await api.createPlaylist(trimmed);
            setPlaylistStatus('Playlist created.');
            await refreshPlaylists();
        } catch (err: any) {
            setPlaylistStatus(err?.message ?? 'Failed to create playlist.');
        }
    };

    const addTracksToPlaylist = async (playlistName: string, trackPaths: string[]) => {
        if (!playlistName || !trackPaths.length) {
            setPlaylistStatus('Select a playlist and tracks.');
            return;
        }
        try {
            for (const path of trackPaths) {
                await api.addToPlaylist(playlistName, path);
            }
            setPlaylistStatus('Added to playlist.');
            await refreshPlaylists();
        } catch (err: any) {
            setPlaylistStatus(err?.message ?? 'Failed to add to playlist.');
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
