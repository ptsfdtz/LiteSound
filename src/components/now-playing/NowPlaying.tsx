import type { Track } from '../../types';
import styles from './NowPlaying.module.css';

type NowPlayingProps = {
  track: Track;
  isPlaying: boolean;
};

function NowPlaying({ track, isPlaying }: NowPlayingProps) {
  return (
    <div className={styles.nowPlayingGroup}>
      <div className={styles.recordWrapper}>
        <div className={`${styles.record} ${isPlaying ? styles.playing : ''}`} aria-hidden="false">
          <div className={styles.label} title={track.title}>
            {track.title}
          </div>
        </div>
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
