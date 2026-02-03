import { useEffect, useMemo, useRef } from 'react';
import { FiltersBar, HeaderBar, PlayerBar, PlaylistSidebar, TrackList } from '@/components';
import { useMusicLibrary } from '@/hooks/useMusicLibrary';
import { usePlaylists } from '@/hooks/usePlaylists';
import { usePlayer } from '@/hooks/usePlayer';
import { useTheme } from '@/hooks/useTheme';
import { findTrackByPath } from '@/utils/media';
import { Toaster } from '@/components/ui/sonner';

function App() {
  const {
    musicDir,
    musicDirs,
    files,
    filteredFiles,
    status,
    setStatus,
    composerFilter,
    setComposerFilter,
    albumFilter,
    setAlbumFilter,
    trackQuery,
    setTrackQuery,
    composers,
    albums,
    lastPlayedPath,
    updateMusicDirs,
    refresh,
  } = useMusicLibrary();

  const {
    playlists,
    activePlaylist,
    selectPlaylist,
    playlistStatus,
    createPlaylist,
    deletePlaylist,
    addTracksToPlaylist,
    removeTrackFromPlaylist,
    favoritePaths,
    toggleFavorite,
  } = usePlaylists();

  const { theme, setTheme } = useTheme();

  const playlistFiles = useMemo(() => {
    if (!activePlaylist) return null;
    const fileMap = new Map(files.map((file) => [file.path, file]));
    return activePlaylist.tracks
      .map((path) => fileMap.get(path))
      .filter((file): file is NonNullable<typeof file> => Boolean(file));
  }, [activePlaylist, files]);

  const visibleFiles = useMemo(() => {
    if (activePlaylist) {
      return playlistFiles ?? [];
    }
    return filteredFiles;
  }, [activePlaylist, filteredFiles, playlistFiles]);

  const player = usePlayer({
    filteredFiles: visibleFiles,
    onStatusChange: setStatus,
  });

  const hasRestoredRef = useRef(false);

  useEffect(() => {
    if (hasRestoredRef.current || !lastPlayedPath || !files.length) {
      return;
    }
    const match = findTrackByPath(visibleFiles, lastPlayedPath);
    if (match) {
      hasRestoredRef.current = true;
      void player.selectTrack(match, { autoplay: false });
    }
  }, [visibleFiles, lastPlayedPath]);

  return (
    <div className="fixed inset-0 flex h-full w-full flex-col gap-6 bg-[var(--app-bg)] px-8 pb-[30px] pt-5 max-[900px]:p-6">
      <HeaderBar
        title="LiteSound"
        onRefresh={refresh}
        musicDir={musicDir}
        musicDirs={musicDirs}
        onSetMusicDirs={updateMusicDirs}
        theme={theme}
        onSetTheme={setTheme}
      />
      <FiltersBar
        composers={composers}
        composerFilter={composerFilter}
        onComposerChange={setComposerFilter}
        albums={albums}
        albumFilter={albumFilter}
        onAlbumChange={setAlbumFilter}
        trackQuery={trackQuery}
        onTrackQueryChange={setTrackQuery}
      />
      <div className="grid max-h-[calc(100%-88px)] flex-1 grid-cols-[minmax(240px,320px)_1fr] gap-6 overflow-hidden max-[900px]:grid-cols-1">
        <PlaylistSidebar
          playlists={playlists}
          activePlaylist={activePlaylist}
          onSelectPlaylist={selectPlaylist}
          onCreatePlaylist={createPlaylist}
          onDeletePlaylist={deletePlaylist}
          onAddTracks={addTracksToPlaylist}
          files={files}
          status={playlistStatus}
          totalTracks={files.length}
        />
        <TrackList
          files={visibleFiles}
          active={player.active}
          favoritePaths={favoritePaths}
          playlistName={activePlaylist?.name}
          onToggleFavorite={toggleFavorite}
          onRemoveFromPlaylist={removeTrackFromPlaylist}
          onSelect={player.selectTrack}
        />
      </div>
      <PlayerBar
        active={player.active}
        isPlaying={player.isPlaying}
        duration={player.duration}
        position={player.position}
        hasTracks={visibleFiles.length > 0}
        volume={player.volume}
        playMode={player.playMode}
        playModeLabel={player.playModeLabel}
        onTogglePlay={player.togglePlay}
        onStop={player.stopPlayback}
        onSeek={player.seekTo}
        onPrev={player.goPrev}
        onNext={player.goNext}
        onVolumeChange={player.setSystemVolume}
        onToggleMute={player.toggleMute}
        onCyclePlayMode={player.cyclePlayMode}
      />
      <Toaster position="top-center" />
    </div>
  );
}

export default App;
