import {useEffect, useMemo, useRef} from 'react';
import styles from './App.module.css';
import {FiltersBar, HeaderBar, PlayerBar, PlaylistControls, TrackList} from './components';
import {useMusicLibrary} from './hooks/useMusicLibrary';
import {usePlaylists} from './hooks/usePlaylists';
import {usePlayer} from './hooks/usePlayer';
import {findTrackByPath} from './utils/media';

function App() {
    const {
        musicDir,
        files,
        filteredFiles,
        status,
        setStatus,
        composerFilter,
        setComposerFilter,
        albumFilter,
        setAlbumFilter,
        composers,
        albums,
        lastPlayedPath,
        refresh,
    } = useMusicLibrary();

    const {
        playlists,
        playlistName,
        setPlaylistName,
        activePlaylist,
        setActivePlaylist,
        playlistStatus,
        createPlaylist,
        addTrackToActivePlaylist,
    } = usePlaylists();

    const player = usePlayer({
        filteredFiles,
        onStatusChange: setStatus,
    });

    const hasRestoredRef = useRef(false);

    useEffect(() => {
        if (hasRestoredRef.current || !lastPlayedPath || !files.length) {
            return;
        }
        const match = findTrackByPath(files, lastPlayedPath);
        if (match) {
            hasRestoredRef.current = true;
            void player.selectTrack(match);
        }
    }, [files, lastPlayedPath]);

    const subtitle = useMemo(() => {
        if (!musicDir) return status;
        return `${musicDir} - ${status}`;
    }, [musicDir, status]);

    return (
        <div className={styles.app}>
            <HeaderBar title="LiteSound" subtitle={subtitle} onRefresh={refresh} />
            <FiltersBar
                composers={composers}
                composerFilter={composerFilter}
                onComposerChange={setComposerFilter}
                albums={albums}
                albumFilter={albumFilter}
                onAlbumChange={setAlbumFilter}
                playlists={playlists}
                activePlaylist={activePlaylist}
                onPlaylistChange={(value) => setActivePlaylist(value)}
            />
            <PlaylistControls
                playlistName={playlistName}
                onNameChange={setPlaylistName}
                onCreate={createPlaylist}
                onAddCurrent={() => addTrackToActivePlaylist(player.active?.path)}
                status={playlistStatus}
                canAdd={Boolean(player.active && activePlaylist)}
            />
            <div className={styles.body}>
                <TrackList files={filteredFiles} active={player.active} onSelect={player.selectTrack} />
            </div>
            <PlayerBar
                active={player.active}
                isPlaying={player.isPlaying}
                duration={player.duration}
                position={player.position}
                hasTracks={filteredFiles.length > 0}
                playMode={player.playMode}
                playModeLabel={player.playModeLabel}
                onTogglePlay={player.togglePlay}
                onStop={player.stopPlayback}
                onSeek={player.seekTo}
                onPrev={player.goPrev}
                onNext={player.goNext}
                onCyclePlayMode={player.cyclePlayMode}
            />
        </div>
    );
}

export default App;
