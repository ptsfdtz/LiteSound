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
import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { formatTime } from '@/utils/media';
import type { MusicFile, PlayMode } from '@/types/media';
import { useI18n } from '@/locales';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

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
    <section className="mt-auto flex justify-center">
      <div className="flex w-[min(960px,100%)] flex-col gap-4 rounded-[18px] border border-border bg-card px-4 py-3 shadow-[0_16px_32px_var(--panel-glow)]">
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="secondary"
            size="icon"
            className="h-10 w-10 rounded-[10px]"
            onClick={onPrev}
            disabled={!hasTracks}
            aria-label={t('player.previous')}
          >
            <FaStepBackward />
          </Button>
          <Button
            variant="default"
            size="icon"
            className="h-10 w-10 rounded-[10px]"
            onClick={onTogglePlay}
            disabled={!active}
            aria-label={isPlaying ? t('player.pause') : t('player.play')}
          >
            {isPlaying ? <FaPause /> : <FaPlay />}
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="h-10 w-10 rounded-[10px]"
            onClick={onNext}
            disabled={!hasTracks}
            aria-label={t('player.next')}
          >
            <FaStepForward />
          </Button>
          <input
            className={cn('player-progress h-1.5 min-w-[180px] flex-1 cursor-pointer')}
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
          <div className="ml-auto text-xs text-muted-foreground">
            {formatTime(clampedPosition)} / {formatTime(duration)}
          </div>
          <Button
            variant="secondary"
            size="icon"
            className="h-10 w-10 rounded-[10px]"
            onClick={onStop}
            disabled={!active}
            aria-label={t('player.stop')}
          >
            <FaStop />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="h-10 w-10 rounded-[10px]"
            onClick={onCyclePlayMode}
            disabled={!hasTracks}
            aria-label={playModeLabel}
            title={playModeLabel}
          >
            {getPlayModeIcon(playMode)}
          </Button>
          <div className="relative inline-flex items-center">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-10 w-10 rounded-[10px]"
                  onClick={onToggleMute}
                  aria-label={volume === 0 ? t('player.unmute') : t('player.mute')}
                >
                  {volume === 0 ? <FaVolumeMute /> : <FaVolumeUp />}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                side="top"
                align="end"
                className="w-16 rounded-[14px] border border-border bg-secondary p-3 shadow-[0_18px_28px_var(--panel-glow)]"
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="text-xs text-muted-foreground">{volume}%</div>
                  <input
                    className="volume-slider h-40 w-6 cursor-pointer"
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={volume}
                    onChange={(event) => onVolumeChange(Number(event.target.value))}
                    style={{ '--volume': volumePercent } as CSSProperties}
                  />
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    </section>
  );
}
