import {useEffect, useRef} from 'react';
import styles from './App.module.css';
import {FiltersBar, HeaderBar, PlayerBar, PlaylistSidebar, TrackList} from './components';
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
        activePlaylist,
        setActivePlaylist,
        playlistStatus,
        createPlaylist,
        addTracksToPlaylist,
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

    return (
        <div className={styles.app}>
            <HeaderBar title="LiteSound" onRefresh={refresh} />
            <FiltersBar
                composers={composers}
                composerFilter={composerFilter}
                onComposerChange={setComposerFilter}
                albums={albums}
                albumFilter={albumFilter}
                onAlbumChange={setAlbumFilter}
            />
            <div className={styles.body}>
                <PlaylistSidebar
                    playlists={playlists}
                    activePlaylist={activePlaylist}
                    onSelectPlaylist={setActivePlaylist}
                    onCreatePlaylist={createPlaylist}
                    onAddTracks={addTracksToPlaylist}
                    files={files}
                    status={playlistStatus}
                />
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
