import { Button, Transition } from '@headlessui/react';
import {
  FaListUl,
  FaPause,
  FaPlay,
  FaRandom,
  FaRetweet,
  FaStepBackward,
  FaStepForward,
  FaStop,
  FaVolumeMute,
  FaVolumeUp,
} from 'react-icons/fa';
import { Fragment, useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { formatTime } from '@/utils/media';
import type { MusicFile, PlayMode } from '@/types/media';
import styles from '@/components/PlayerBar/PlayerBar.module.css';
import { useI18n } from '@/locales';

type PlayerBarProps = {
  active?: MusicFile;
  isPlaying: boolean;
  duration: number;
  position: number;
  hasTracks: boolean;
  volume: number;
  playMode: PlayMode;
  playModeLabel: string;
  onTogglePlay: () => void;
  onStop: () => void;
  onSeek: (value: number) => void;
  onPrev: () => void;
  onNext: () => void;
  onVolumeChange: (value: number) => void;
  onToggleMute: () => void;
  onCyclePlayMode: () => void;
};

function getPlayModeIcon(playMode: PlayMode) {
  if (playMode === 'repeat') return <FaRetweet />;
  if (playMode === 'shuffle') return <FaRandom />;
  return <FaListUl />;
}

export function PlayerBar(props: PlayerBarProps) {
  const {
    active,
    isPlaying,
    duration,
    position,
    hasTracks,
    volume,
    playMode,
    playModeLabel,
    onTogglePlay,
    onStop,
    onSeek,
    onPrev,
    onNext,
    onVolumeChange,
    onToggleMute,
    onCyclePlayMode,
  } = props;
  const { t } = useI18n();

  const [isSeeking, setIsSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(0);
  const [isVolumeOpen, setIsVolumeOpen] = useState(false);
  const seekValueRef = useRef(0);
  const displayPosition = isSeeking ? seekValue : position;
  const clampedPosition = Math.min(displayPosition, duration || 0);
  const progressPercent = duration
    ? `${Math.min(100, Math.max(0, (clampedPosition / duration) * 100))}%`
    : '0%';
  const volumePercent = `${Math.min(100, Math.max(0, volume))}%`;

  useEffect(() => {
    seekValueRef.current = seekValue;
  }, [seekValue]);

  useEffect(() => {
    if (!isSeeking) {
      setSeekValue(clampedPosition);
    }
  }, [clampedPosition, isSeeking]);

  useEffect(() => {
    if (!isSeeking) return;
    const handleCommit = () => {
      setIsSeeking(false);
      onSeek(seekValueRef.current);
    };
    window.addEventListener('pointerup', handleCommit);
    window.addEventListener('pointercancel', handleCommit);
    return () => {
      window.removeEventListener('pointerup', handleCommit);
      window.removeEventListener('pointercancel', handleCommit);
    };
  }, [isSeeking, onSeek]);

  return (
    <section className={styles.player}>
      <div className={styles.card}>
        <div className={styles.controls}>
          <Button
            className={`${styles.button} ${styles.ghost}`}
            onClick={onPrev}
            disabled={!hasTracks}
            aria-label={t('player.previous')}
          >
            <FaStepBackward />
          </Button>
          <Button
            className={styles.button}
            onClick={onTogglePlay}
            disabled={!active}
            aria-label={isPlaying ? t('player.pause') : t('player.play')}
          >
            {isPlaying ? <FaPause /> : <FaPlay />}
          </Button>
          <Button
            className={`${styles.button} ${styles.ghost}`}
            onClick={onNext}
            disabled={!hasTracks}
            aria-label={t('player.next')}
          >
            <FaStepForward />
          </Button>
          <input
            className={styles.progress}
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={clampedPosition}
            onPointerDown={() => {
              if (!active) return;
              setIsSeeking(true);
              setSeekValue(clampedPosition);
            }}
            onChange={(event) => {
              const value = Number(event.target.value);
              setSeekValue(value);
              if (!isSeeking) {
                onSeek(value);
              }
            }}
            disabled={!active}
            style={{ '--progress': progressPercent } as CSSProperties}
          />
          <div className={styles.time}>
            {formatTime(clampedPosition)} / {formatTime(duration)}
          </div>
          <Button
            className={styles.button}
            onClick={onStop}
            disabled={!active}
            aria-label={t('player.stop')}
          >
            <FaStop />
          </Button>
          <Button
            className={`${styles.button} ${styles.ghost}`}
            onClick={onCyclePlayMode}
            disabled={!hasTracks}
            aria-label={playModeLabel}
            title={playModeLabel}
          >
            {getPlayModeIcon(playMode)}
          </Button>
          <div
            className={styles.volume}
            onMouseEnter={() => setIsVolumeOpen(true)}
            onMouseLeave={() => setIsVolumeOpen(false)}
          >
            <Button
              className={`${styles.button} ${styles.ghost}`}
              onClick={onToggleMute}
              aria-label={volume === 0 ? t('player.unmute') : t('player.mute')}
            >
              {volume === 0 ? <FaVolumeMute /> : <FaVolumeUp />}
            </Button>
            <Transition
              as={Fragment}
              show={isVolumeOpen}
              enter={styles.volumeEnter}
              enterFrom={styles.volumeEnterFrom}
              enterTo={styles.volumeEnterTo}
              leave={styles.volumeLeave}
              leaveFrom={styles.volumeLeaveFrom}
              leaveTo={styles.volumeLeaveTo}
            >
              <div className={styles.volumePopover}>
                <div className={styles.volumeValue}>{volume}%</div>
                <input
                  className={styles.volumeSlider}
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={volume}
                  onChange={(event) => onVolumeChange(Number(event.target.value))}
                  style={{ '--volume': volumePercent } as CSSProperties}
                />
              </div>
            </Transition>
          </div>
        </div>
      </div>
    </section>
  );
}
