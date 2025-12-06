import type { Track } from '../../types';
import styles from './NowPlaying.module.css';

type NowPlayingProps = {
  track: Track;
};

function NowPlaying({ track }: NowPlayingProps) {
  return (
    <div className={styles.nowPlayingGroup}>
      <div className={styles.lyricsWrapper}>
        {track.lyrics && track.lyrics.length > 0 ? (
          <div className={styles.lyricsBox}>
            {track.lyrics.map((line, index) => (
              <div key={index} className={styles.lyricLine}>
                {line}
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.noLyrics}>No lyrics available</div>
        )}
      </div>
      <div className={styles.trackInfoBottom}>
        <div className={styles.trackTitle}>{track.title}</div>
        <div className={styles.infoRow}>
          <div className={styles.infoText}>
            <span className={styles.trackMeta}>{track.artist}</span>
            {track.album && <span className={styles.separator}>/</span>}
            {track.album && <span className={styles.albumName}>{track.album}</span>}
          </div>
          <div className={styles.badges}>
            <span className={styles.badge}>FLAC</span>
            <span className={styles.badge}>Offline</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NowPlaying;
