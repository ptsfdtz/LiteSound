import {Listbox, Menu, Transition} from '@headlessui/react';
import {Fragment, useEffect, useMemo, useState} from 'react';
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

    const selectTrack = async (file?: MusicFile) => {
        if (!file) {
            setActive(undefined);
            return;
        }
        setActive(file);
        setStatus(`Loading ${file.name}...`);
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
            setStatus('Ready');
        } catch (err: any) {
            setStatus(err?.message ?? 'Failed to load audio file.');
        }
    };

    return (
        <div className="app">
            <header className="app-header">
                <div>
                    <h1>LiteSound</h1>
                    <p>{subtitle}</p>
                </div>
                <Menu as="div" className="menu">
                    <Menu.Button className="ghost">Actions</Menu.Button>
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
                                    <button
                                        className={isActive ? 'menu-item active' : 'menu-item'}
                                        onClick={refresh}
                                    >
                                        Refresh
                                    </button>
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
                                        <div className={optionActive ? 'track active' : 'track'}>
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
                    <div className="player-title">
                        {active ? active.name : 'Select a track'}
                    </div>
                    <audio controls src={audioUrl ?? undefined} />
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
