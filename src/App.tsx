import { useState, useMemo } from 'react';
import FooterControls from './components/footer/FooterControls';
import HeaderBar from './components/header/HeaderBar';
import NowPlaying from './components/now-playing/NowPlaying';
import Queue from './components/queue/Queue';
import Sider from './components/sider/Sider';
import FilterBar from './components/filter-bar/FilterBar';
import ThemeModal from './components/common/theme-modal/ThemeModal';
import { useTheme } from './hooks/useTheme';
import { useAudioPlayer } from './hooks/useAudioPlayer';
import { SAMPLE_PLAYLISTS, DEFAULT_VOLUME, PLAYLIST_TRACKS } from './constants';
import styles from './App.module.css';

function App() {
  const { theme, setTheme } = useTheme();
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [activePlaylist, setActivePlaylist] = useState('Favorites');
  const [artistFilter, setArtistFilter] = useState('all');
  const [albumFilter, setAlbumFilter] = useState('all');

  const playlistTracks = useMemo(() => PLAYLIST_TRACKS[activePlaylist] || [], [activePlaylist]);

  // 获取可用的艺术家和专辑列表
  const { artists, albums } = useMemo(() => {
    const artistSet = new Set<string>();
    const albumSet = new Set<string>();
    playlistTracks.forEach((track) => {
      artistSet.add(track.artist);
      if (track.album) albumSet.add(track.album);
    });
    return {
      artists: Array.from(artistSet).sort(),
      albums: Array.from(albumSet).sort(),
    };
  }, [playlistTracks]);

  // 应用筛选
  const filteredTracks = useMemo(() => {
    return playlistTracks.filter((track) => {
      const matchArtist = artistFilter === 'all' || track.artist === artistFilter;
      const matchAlbum = albumFilter === 'all' || track.album === albumFilter;
      return matchArtist && matchAlbum;
    });
  }, [playlistTracks, artistFilter, albumFilter]);

  // 重置筛选条件当切换播放列表时
  const handlePlaylistChange = (playlist: string) => {
    setActivePlaylist(playlist);
    setArtistFilter('all');
    setAlbumFilter('all');
  };

  const {
    currentIndex,
    currentTrack,
    progress,
    volume,
    isPlaying,
    handlePrev,
    handleNext,
    handleSelectTrack,
    handleTogglePlay,
    handleVolumeChange,
    handleProgressChange,
  } = useAudioPlayer({
    tracks: filteredTracks,
    initialVolume: DEFAULT_VOLUME,
  });

  return (
    <div className={styles.app}>
      <div className={styles.sider}>
        <Sider playlists={SAMPLE_PLAYLISTS} activePlaylist={activePlaylist} onPlaylistSelect={handlePlaylistChange} />
      </div>
      <div className={styles.main}>
        <div className={styles.header}>
          <HeaderBar
            title={activePlaylist}
            placeholder="Search tracks"
            onOpenSettings={() => setShowThemeModal(true)}
          />
        </div>
        <div className={styles.content}>
          <div className={styles.nowPlaying}>
            <NowPlaying track={currentTrack} />
          </div>
          <div className={styles.playlist}>
            <FilterBar
              artistFilter={artistFilter}
              albumFilter={albumFilter}
              onArtistChange={setArtistFilter}
              onAlbumChange={setAlbumFilter}
              artists={artists}
              albums={albums}
            />
            <Queue tracks={filteredTracks} currentIndex={currentIndex} onSelect={handleSelectTrack} />
          </div>
        </div>
      </div>
      <div className={styles.footer}>
        <FooterControls
          isPlaying={isPlaying}
          volume={volume}
          trackDuration={currentTrack.duration}
          progress={progress}
          onPrev={handlePrev}
          onNext={handleNext}
          onTogglePlay={handleTogglePlay}
          onVolumeChange={handleVolumeChange}
          onProgressChange={handleProgressChange}
        />
      </div>
      <ThemeModal
        open={showThemeModal}
        value={theme}
        onSelect={(value) => setTheme(value)}
        onClose={() => setShowThemeModal(false)}
      />
    </div>
  );
}

export default App;
