import {Button, Listbox, Menu, Transition} from '@headlessui/react';
import {Howl} from 'howler';
import {FaCog, FaListUl, FaPause, FaPlay, FaRandom, FaRetweet, FaStepBackward, FaStepForward, FaStop} from 'react-icons/fa';
import {Fragment, useEffect, useMemo, useRef, useState} from 'react';
import type {CSSProperties} from 'react';
import './App.css';
import {GetMusicDir, ListMusicFiles, ReadMusicFile} from '../wailsjs/go/main/App';

type MusicFile = {
    name: string;
    path: string;
    ext: string;
    composer: string;
    album: string;
};

const mimeByExt: Record<string, string> = {
    '.mp3': 'audio/mpeg',
    '.flac': 'audio/flac',
    '.wav': 'audio/wav',
    '.ogg': 'audio/ogg',
    '.m4a': 'audio/mp4',
    '.aac': 'audio/aac',
};

function App() {
    const [musicDir, setMusicDir] = useState('');
    const [files, setFiles] = useState<MusicFile[]>([]);
    const [active, setActive] = useState<MusicFile | undefined>(undefined);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [status, setStatus] = useState('Loading...');
    const [composerFilter, setComposerFilter] = useState('All');
    const [albumFilter, setAlbumFilter] = useState('All');
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [position, setPosition] = useState(0);
    const [playMode, setPlayMode] = useState<'order' | 'repeat' | 'shuffle'>('order');
    const howlRef = useRef<Howl | null>(null);
    const rafRef = useRef<number | null>(null);

    useEffect(() => {
        let mounted = true;
        Promise.all([GetMusicDir(), ListMusicFiles()])
            .then(([dir, list]) => {
                if (!mounted) return;
                setMusicDir(dir);
                setFiles(list);
                setStatus(list.length ? 'Ready' : 'No audio files found.');
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
        return () => {
            if (audioUrl) {
                URL.revokeObjectURL(audioUrl);
            }
        };
    }, [audioUrl]);

    useEffect(() => {
        return () => {
            if (howlRef.current) {
                howlRef.current.unload();
            }
            stopProgress();
        };
    }, []);

    const subtitle = useMemo(() => {
        if (!musicDir) return status;
        return `${musicDir} - ${status}`;
    }, [musicDir, status]);

    const refresh = async () => {
        setStatus('Loading...');
        try {
            const list = await ListMusicFiles();
            setFiles(list);
            setStatus(list.length ? 'Ready' : 'No audio files found.');
        } catch (err: any) {
            setStatus(err?.message ?? 'Failed to refresh.');
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

    const activeIndex = useMemo(() => {
        if (!active) return -1;
        return filteredFiles.findIndex((file) => file.path === active.path);
    }, [active, filteredFiles]);

    const selectTrack = async (file?: MusicFile) => {
        if (!file) {
            setActive(undefined);
            return;
        }
        setActive(file);
        setStatus(`Loading ${file.name}...`);
        setPosition(0);
        try {
            const data = await ReadMusicFile(file.path);
            const bytes = toBytes(data as unknown);
            const type = mimeByExt[file.ext] ?? 'audio/mpeg';
            const arrayBuffer = bytes.slice().buffer;
            const blob = new Blob([arrayBuffer], {type});
            const url = URL.createObjectURL(blob);
            if (audioUrl) {
                URL.revokeObjectURL(audioUrl);
            }
            setAudioUrl(url);
            if (howlRef.current) {
                howlRef.current.unload();
            }
            const howl = new Howl({
                src: [url],
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
            setStatus('Ready');
        } catch (err: any) {
            setStatus(err?.message ?? 'Failed to load audio file.');
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

    const cyclePlayMode = () => {
        setPlayMode((current) => {
            if (current === 'order') return 'repeat';
            if (current === 'repeat') return 'shuffle';
            return 'order';
        });
    };

    const playModeIcon = useMemo(() => {
        if (playMode === 'repeat') return <FaRetweet />;
        if (playMode === 'shuffle') return <FaRandom />;
        return <FaListUl />;
    }, [playMode]);

    const playModeLabel = useMemo(() => {
        if (playMode === 'repeat') return 'Repeat one';
        if (playMode === 'shuffle') return 'Shuffle';
        return 'Play in order';
    }, [playMode]);

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

    const progressPercent = useMemo(() => {
        if (!duration) return '0%';
        const percent = Math.min(100, Math.max(0, (position / duration) * 100));
        return `${percent}%`;
    }, [position, duration]);

    return (
        <div className="app">
            <header className="app-header">
                    <h1>LiteSound</h1>
                <Menu as="div" className="menu">
                    <Menu.Button className="ghost" aria-label="Settings">
                        <FaCog />
                    </Menu.Button>
                    <Transition
                        as={Fragment}
                        enter="menu-enter"
                        enterFrom="menu-enter-from"
                        enterTo="menu-enter-to"
                        leave="menu-leave"
                        leaveFrom="menu-leave-from"
                        leaveTo="menu-leave-to"
                    >
                        <Menu.Items className="menu-items">
                            <Menu.Item>
                                {({active: isActive}) => (
                                    <Button
                                        className={isActive ? 'menu-item active' : 'menu-item'}
                                        onClick={refresh}
                                    >
                                        Refresh
                                    </Button>
                                )}
                            </Menu.Item>
                        </Menu.Items>
                    </Transition>
                </Menu>
            </header>
            <div className="filters">
                <div className="filter-item">
                    <Listbox value={composerFilter} onChange={setComposerFilter}>
                        <Listbox.Button className="filter-trigger">
                            Composer: {composerFilter}
                        </Listbox.Button>
                        <Transition
                            as={Fragment}
                            enter="menu-enter"
                            enterFrom="menu-enter-from"
                            enterTo="menu-enter-to"
                            leave="menu-leave"
                            leaveFrom="menu-leave-from"
                            leaveTo="menu-leave-to"
                        >
                            <Listbox.Options className="filter-options">
                                {composers.map((name) => (
                                    <Listbox.Option key={name} value={name} className="filter-option">
                                        {({active: optionActive, selected}) => (
                                            <div className={optionActive ? 'filter-row active' : 'filter-row'}>
                                                <span>{name}</span>
                                                {selected && <span className="filter-selected">selected</span>}
                                            </div>
                                        )}
                                    </Listbox.Option>
                                ))}
                            </Listbox.Options>
                        </Transition>
                    </Listbox>
                </div>
                <div className="filter-item">
                    <Listbox value={albumFilter} onChange={setAlbumFilter}>
                        <Listbox.Button className="filter-trigger">
                            Album: {albumFilter}
                        </Listbox.Button>
                        <Transition
                            as={Fragment}
                            enter="menu-enter"
                            enterFrom="menu-enter-from"
                            enterTo="menu-enter-to"
                            leave="menu-leave"
                            leaveFrom="menu-leave-from"
                            leaveTo="menu-leave-to"
                        >
                            <Listbox.Options className="filter-options">
                                {albums.map((name) => (
                                    <Listbox.Option key={name} value={name} className="filter-option">
                                        {({active: optionActive, selected}) => (
                                            <div className={optionActive ? 'filter-row active' : 'filter-row'}>
                                                <span>{name}</span>
                                                {selected && <span className="filter-selected">selected</span>}
                                            </div>
                                        )}
                                    </Listbox.Option>
                                ))}
                            </Listbox.Options>
                        </Transition>
                    </Listbox>
                </div>
            </div>
            <div className="app-body">
                <aside className="track-list">
                    <Listbox value={active} by="path" onChange={selectTrack}>
                        <Listbox.Button className="track-list-trigger">
                            {active ? active.name : 'Select a track'}
                        </Listbox.Button>
                        <Listbox.Options className="track-options" static>
                            {filteredFiles.map((file) => (
                                <Listbox.Option key={file.path} value={file} className="track-option">
                                    {({active: optionActive, selected}) => (
                                        <div className={selected || optionActive ? 'track active' : 'track'}>
                                            <span className="track-name">{file.name}</span>
                                            <span className="track-ext">{selected ? 'playing' : file.ext}</span>
                                        </div>
                                    )}
                                </Listbox.Option>
                            ))}
                            {!filteredFiles.length && <div className="empty">No tracks match the filters.</div>}
                        </Listbox.Options>
                    </Listbox>
                </aside>
            </div>
            <section className="player">
                <div className="player-card">
                    <div className="player-controls">
                        <Button
                            className="player-button"
                            onClick={togglePlay}
                            disabled={!active}
                            aria-label={isPlaying ? 'Pause' : 'Play'}
                        >
                            {isPlaying ? <FaPause /> : <FaPlay />}
                        </Button>
                        <Button
                            className="player-button"
                            onClick={stopPlayback}
                            disabled={!active}
                            aria-label="Stop"
                        >
                            <FaStop />
                        </Button>
                        <input
                            className="player-progress"
                            type="range"
                            min={0}
                            max={duration || 0}
                            step={0.1}
                            value={Math.min(position, duration || 0)}
                            onChange={(event) => seekTo(Number(event.target.value))}
                            disabled={!active}
                            style={{'--progress': progressPercent} as CSSProperties}
                        />
                        <div className="player-time">
                            {formatTime(position)} / {formatTime(duration)}
                        </div>
                        <Button
                            className="player-button ghost"
                            onClick={goPrev}
                            disabled={!filteredFiles.length}
                            aria-label="Previous"
                        >
                            <FaStepBackward />
                        </Button>
                        <Button
                            className="player-button ghost"
                            onClick={cyclePlayMode}
                            disabled={!filteredFiles.length}
                            aria-label={playModeLabel}
                            title={playModeLabel}
                        >
                            {playModeIcon}
                        </Button>
                        <Button
                            className="player-button ghost"
                            onClick={goNext}
                            disabled={!filteredFiles.length}
                            aria-label="Next"
                        >
                            <FaStepForward />
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default App

function toBytes(data: unknown): Uint8Array {
    if (typeof data === 'string') {
        const binary = atob(data);
        const len = binary.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i += 1) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes;
    }
    if (Array.isArray(data)) {
        return new Uint8Array(data);
    }
    if (data instanceof ArrayBuffer) {
        return new Uint8Array(data);
    }
    return new Uint8Array();
}

function formatTime(value: number): string {
    if (!Number.isFinite(value)) {
        return '0:00';
    }
    const minutes = Math.floor(value / 60);
    const seconds = Math.floor(value % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function pickRandomIndex(currentIndex: number, length: number): number {
    if (length <= 1) return 0;
    let next = Math.floor(Math.random() * length);
    if (next === currentIndex) {
        next = (next + 1) % length;
    }
    return next;
}
