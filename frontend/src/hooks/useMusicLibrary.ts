import {useEffect, useMemo, useState} from 'react';
import {api} from '@/services/api';
import type {MusicFile} from '@/types/media';

export function useMusicLibrary() {
    const [musicDir, setMusicDir] = useState('');
    const [musicDirs, setMusicDirs] = useState<string[]>([]);
    const [files, setFiles] = useState<MusicFile[]>([]);
    const [status, setStatus] = useState('Loading...');
    const [composerFilter, setComposerFilter] = useState('All');
    const [albumFilter, setAlbumFilter] = useState('All');
    const [lastPlayedPath, setLastPlayedPath] = useState('');

    useEffect(() => {
        let mounted = true;
        Promise.all([api.getMusicDirs(), api.listMusicFiles(), api.getLastPlayed(), api.getFilters()])
            .then(([dirs, list, lastPlayed, filters]) => {
                if (!mounted) return;
                setMusicDirs(dirs);
                setMusicDir(dirs[0] ?? '');
                setFiles(list);
                setStatus(list.length ? 'Ready' : 'No audio files found.');
                setLastPlayedPath(lastPlayed || '');
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
                setStatus(err?.message ?? 'Failed to load music directory.');
            });
        return () => {
            mounted = false;
        };
    }, []);

    useEffect(() => {
        void api.setFilters(composerFilter, albumFilter);
    }, [composerFilter, albumFilter]);

    const refresh = async () => {
        setStatus('Loading...');
        try {
            const list = await api.listMusicFiles();
            setFiles(list);
            setStatus(list.length ? 'Ready' : 'No audio files found.');
        } catch (err: any) {
            setStatus(err?.message ?? 'Failed to refresh.');
        }
    };

    const updateMusicDirs = async (paths: string[]) => {
        setStatus('Updating music directory...');
        try {
            const nextDirs = await api.setMusicDirs(paths);
            setMusicDirs(nextDirs);
            setMusicDir(nextDirs[0] ?? '');
            await refresh();
        } catch (err: any) {
            setStatus(err?.message ?? 'Failed to update music directory.');
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
        return files.filter((file) => {
            const composer = file.composer?.trim() || 'Unknown';
            const album = file.album?.trim() || 'Unknown';
            if (composerFilter !== 'All' && composer !== composerFilter) {
                return false;
            }
            if (albumFilter !== 'All' && album !== albumFilter) {
                return false;
            }
            return true;
        });
    }, [files, composerFilter, albumFilter]);

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
        lastPlayedPath,
        updateMusicDirs,
        refresh,
        composers,
        albums,
        filteredFiles,
    };
}
