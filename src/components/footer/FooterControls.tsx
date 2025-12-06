import { FiPause, FiPlay, FiSkipBack, FiSkipForward } from 'react-icons/fi';
import IconButton from '../common/icon-button/IconButton';
import { calculateCurrentTime } from '../../utils/helpers';
import styles from './FooterControls.module.css';

type FooterControlsProps = {
  isPlaying: boolean;
  volume: number;
  trackDuration: string;
  progress: number;
  onPrev: () => void;
  onNext: () => void;
  onTogglePlay: () => void;
  onVolumeChange: (value: number) => void;
  onProgressChange: (value: number) => void;
};

function FooterControls({
  isPlaying,
  volume,
  trackDuration,
  progress,
  onPrev,
  onNext,
  onTogglePlay,
  onVolumeChange,
  onProgressChange,
}: FooterControlsProps) {
  return (
    <div className={styles.controls}>
      <div className={styles.transport}>
        <IconButton ariaLabel="Previous track" onClick={onPrev}>
          <FiSkipBack size={18} />
        </IconButton>
        <IconButton ariaLabel={isPlaying ? 'Pause' : 'Play'} onClick={onTogglePlay}>
          {isPlaying ? <FiPause size={20} /> : <FiPlay size={20} />}
        </IconButton>
        <IconButton ariaLabel="Next track" onClick={onNext}>
          <FiSkipForward size={18} />
        </IconButton>
      </div>
      <div className={styles.progressRow}>
        <span className={styles.timeLabel}>{calculateCurrentTime(progress, trackDuration)}</span>
        <input
          type="range"
          min="0"
          max="100"
          value={progress}
          onChange={(e) => onProgressChange(Number(e.target.value))}
        />
        <span className={styles.timeLabel}>{trackDuration}</span>
      </div>
      <div className={styles.volumeRow}>
        <span className={styles.sectionTitle}>Volume</span>
        <input type="range" min="0" max="100" value={volume} onChange={(e) => onVolumeChange(Number(e.target.value))} />
        <span className={styles.timeLabel}>{volume}%</span>
      </div>
    </div>
  );
}

export default FooterControls;
