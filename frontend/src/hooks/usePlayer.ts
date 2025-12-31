import {Howl} from 'howler';
import {useEffect, useMemo, useRef, useState} from 'react';
import {api} from '../services/api';
import type {MusicFile, PlayMode} from '../types/media';
import {pickRandomIndex} from '../utils/media';

type UsePlayerOptions = {
    filteredFiles: MusicFile[];
    onStatusChange?: (status: string) => void;
};

export function usePlayer(options: UsePlayerOptions) {
    const {filteredFiles, onStatusChange} = options;
    const [active, setActive] = useState<MusicFile | undefined>(undefined);
    const [streamBaseURL, setStreamBaseURL] = useState('');
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [position, setPosition] = useState(0);
    const [playMode, setPlayMode] = useState<PlayMode>('order');
    const howlRef = useRef<Howl | null>(null);
    const rafRef = useRef<number | null>(null);

    const activeIndex = useMemo(() => {
        if (!active) return -1;
        return filteredFiles.findIndex((file) => file.path === active.path);
    }, [active, filteredFiles]);

    useEffect(() => {
        let mounted = true;
        api.getStreamBaseURL()
            .then((url) => {
                if (!mounted) return;
                setStreamBaseURL(url);
            })
            .catch(() => {
                if (!mounted) return;
                setStreamBaseURL('');
            });
        return () => {
            mounted = false;
        };
    }, []);

    useEffect(() => {
        return () => {
            if (howlRef.current) {
                howlRef.current.unload();
            }
            stopProgress();
        };
    }, []);

    const startProgress = () => {
        stopProgress();
        const step = () => {
            if (!howlRef.current) return;
            const current = Number(howlRef.current.seek() || 0);
            setPosition(current);
            if (howlRef.current.playing()) {
                rafRef.current = requestAnimationFrame(step);
            }
        };
        rafRef.current = requestAnimationFrame(step);
    };

    const stopProgress = () => {
        if (rafRef.current) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
        }
    };

    const handleTrackEnd = () => {
        if (!filteredFiles.length) return;
        if (playMode === 'repeat' && active) {
            void selectTrack(active);
            return;
        }
        if (playMode === 'shuffle') {
            void selectTrack(filteredFiles[pickRandomIndex(activeIndex, filteredFiles.length)]);
            return;
        }
        const index = activeIndex === -1 ? -1 : activeIndex;
        const nextIndex = (index + 1) % filteredFiles.length;
        void selectTrack(filteredFiles[nextIndex]);
    };

    const selectTrack = async (file?: MusicFile) => {
        if (!file) {
            setActive(undefined);
            return;
        }
        setActive(file);
        onStatusChange?.(`Loading ${file.name}...`);
        setPosition(0);
        try {
            const baseURL = streamBaseURL || (await api.getStreamBaseURL());
            if (!baseURL) {
                onStatusChange?.('Stream server unavailable.');
                return;
            }
            const url = new URL('/media', baseURL);
            url.searchParams.set('path', file.path);
            if (howlRef.current) {
                howlRef.current.unload();
            }
            const howl = new Howl({
                src: [url.toString()],
                html5: true,
                onload: () => {
                    setDuration(howl.duration() || 0);
                },
                onplay: () => {
                    setIsPlaying(true);
                    startProgress();
                },
                onpause: () => {
                    setIsPlaying(false);
                },
                onstop: () => {
                    setIsPlaying(false);
                    setPosition(0);
                },
                onend: () => {
                    setIsPlaying(false);
                    setPosition(0);
                    handleTrackEnd();
                },
            });
            howlRef.current = howl;
            howl.play();
            onStatusChange?.('Ready');
            void api.setLastPlayed(file.path);
        } catch (err: any) {
            onStatusChange?.(err?.message ?? 'Failed to load audio file.');
        }
    };

    const togglePlay = () => {
        if (!howlRef.current) return;
        if (howlRef.current.playing()) {
            howlRef.current.pause();
            setIsPlaying(false);
            return;
        }
        howlRef.current.play();
    };

    const stopPlayback = () => {
        if (!howlRef.current) return;
        howlRef.current.stop();
        setIsPlaying(false);
        setPosition(0);
    };

    const goPrev = () => {
        if (!filteredFiles.length) return;
        if (playMode === 'shuffle') {
            void selectTrack(filteredFiles[pickRandomIndex(activeIndex, filteredFiles.length)]);
            return;
        }
        const index = activeIndex === -1 ? 0 : activeIndex;
        const nextIndex = (index - 1 + filteredFiles.length) % filteredFiles.length;
        void selectTrack(filteredFiles[nextIndex]);
    };

    const goNext = () => {
        if (!filteredFiles.length) return;
        if (playMode === 'shuffle') {
            void selectTrack(filteredFiles[pickRandomIndex(activeIndex, filteredFiles.length)]);
            return;
        }
        const index = activeIndex === -1 ? -1 : activeIndex;
        const nextIndex = (index + 1) % filteredFiles.length;
        void selectTrack(filteredFiles[nextIndex]);
    };

    const seekTo = (value: number) => {
        if (!howlRef.current) return;
        howlRef.current.seek(value);
        setPosition(value);
    };

    const cyclePlayMode = () => {
        setPlayMode((current) => {
            if (current === 'order') return 'repeat';
            if (current === 'repeat') return 'shuffle';
            return 'order';
        });
    };

    const playModeLabel = useMemo(() => {
        if (playMode === 'repeat') return 'Repeat one';
        if (playMode === 'shuffle') return 'Shuffle';
        return 'Play in order';
    }, [playMode]);

    return {
        active,
        isPlaying,
        duration,
        position,
        playMode,
        playModeLabel,
        selectTrack,
        togglePlay,
        stopPlayback,
        goPrev,
        goNext,
        seekTo,
        cyclePlayMode,
    };
}
