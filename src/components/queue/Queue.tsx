import type { Track } from '../../types';
import styles from './Queue.module.css';

type QueueProps = {
  tracks: Track[];
  currentIndex: number;
  onSelect: (index: number) => void;
};

function Queue({ tracks, currentIndex, onSelect }: QueueProps) {
  return (
    <div className={styles.queueRoot}>
      <div className={styles.sectionTitle}>Queue</div>
      <ul className={styles.queue}>
        {tracks.map((track, index) => (
          <li
            key={track.title}
            className={`${styles.queueItem} ${currentIndex === index ? styles.active : ''}`}
            onClick={() => onSelect(index)}
          >
            <div>
              <div className={styles.queueTitle}>{track.title}</div>
              <div className={styles.queueArtist}>{track.artist}</div>
            </div>
            <span className={styles.queueDuration}>{track.duration}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Queue;
