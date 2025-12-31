import {useEffect, useState} from 'react';
import {api} from '../services/api';
import type {Playlist} from '../types/media';

export function usePlaylists() {
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [playlistName, setPlaylistName] = useState('');
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

    const createPlaylist = async () => {
        const name = playlistName.trim();
        if (!name) {
            setPlaylistStatus('Playlist name is required.');
            return;
        }
        try {
            await api.createPlaylist(name);
            setPlaylistName('');
            setPlaylistStatus('Playlist created.');
            await refreshPlaylists();
        } catch (err: any) {
            setPlaylistStatus(err?.message ?? 'Failed to create playlist.');
        }
    };

    const addTrackToActivePlaylist = async (trackPath?: string) => {
        if (!trackPath || !activePlaylist) {
            setPlaylistStatus('Select a playlist and track.');
            return;
        }
        try {
            await api.addToPlaylist(activePlaylist.name, trackPath);
            setPlaylistStatus('Added to playlist.');
            await refreshPlaylists();
        } catch (err: any) {
            setPlaylistStatus(err?.message ?? 'Failed to add to playlist.');
        }
    };

    return {
        playlists,
        playlistName,
        setPlaylistName,
        activePlaylist,
        setActivePlaylist,
        playlistStatus,
        refreshPlaylists,
        createPlaylist,
        addTrackToActivePlaylist,
    };
}
