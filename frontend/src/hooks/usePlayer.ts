import { Howl } from 'howler';
import { useEffect, useMemo, useRef, useState } from 'react';
import { api } from '@/services/api';
import type { MusicFile, PlayMode } from '@/types/media';
import { pickRandomIndex } from '@/utils/media';
import { EventsOn } from '../../wailsjs/runtime/runtime';
import { useI18n } from '@/locales';

type UsePlayerOptions = {
  filteredFiles: MusicFile[];
  onStatusChange?: (status: string) => void;
};

export function usePlayer(options: UsePlayerOptions) {
  const { t } = useI18n();
  const { filteredFiles, onStatusChange } = options;
  const [active, setActive] = useState<MusicFile | undefined>(undefined);
  const [streamBaseURL, setStreamBaseURL] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [playMode, setPlayMode] = useState<PlayMode>('order');
  const [volume, setVolume] = useState(100);
  const howlRef = useRef<Howl | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastVolumeRef = useRef(100);

  const activeIndex = useMemo(() => {
    if (!active) return -1;
    return filteredFiles.findIndex((file) => file.path === active.path);
  }, [active, filteredFiles]);

  useEffect(() => {
    let mounted = true;
    api
      .getStreamBaseURL()
      .then((url) => {
        if (!mounted) return;
        setStreamBaseURL(url);
      })
      .catch(() => {
        if (!mounted) return;
        setStreamBaseURL('');
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    api
      .getSystemVolume()
      .then((value) => {
        if (!mounted) return;
        const next = Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : 100;
        setVolume(next);
        if (next > 0) {
          lastVolumeRef.current = next;
        }
      })
      .catch(() => {
        if (!mounted) return;
        setVolume(100);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (howlRef.current) {
        howlRef.current.unload();
      }
      stopProgress();
    };
  }, []);

  const startProgress = () => {
    stopProgress();
    const step = () => {
      if (!howlRef.current) return;
      const current = Number(howlRef.current.seek() || 0);
      setPosition(current);
      if (howlRef.current.playing()) {
        rafRef.current = requestAnimationFrame(step);
      }
    };
    rafRef.current = requestAnimationFrame(step);
  };

  const stopProgress = () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  const handleTrackEnd = () => {
    if (!filteredFiles.length) return;
    if (playMode === 'repeat' && active) {
      void selectTrack(active);
      return;
    }
    if (playMode === 'shuffle') {
      void selectTrack(filteredFiles[pickRandomIndex(activeIndex, filteredFiles.length)]);
      return;
    }
    const index = activeIndex === -1 ? -1 : activeIndex;
    const nextIndex = (index + 1) % filteredFiles.length;
    void selectTrack(filteredFiles[nextIndex]);
  };

  const selectTrack = async (file?: MusicFile, options?: { autoplay?: boolean }) => {
    if (!file) {
      setActive(undefined);
      return;
    }
    const shouldAutoplay = options?.autoplay !== false;
    setActive(file);
    onStatusChange?.(t('playerStatus.loadingFile', { name: file.name }));
    setPosition(0);
    try {
      const baseURL = streamBaseURL || (await api.getStreamBaseURL());
      if (!baseURL) {
        onStatusChange?.(t('playerStatus.streamUnavailable'));
        return;
      }
      const url = new URL('/media', baseURL);
      url.searchParams.set('path', file.path);
      if (howlRef.current) {
        howlRef.current.unload();
      }
      const howl = new Howl({
        src: [url.toString()],
        html5: true,
        onload: () => {
          setDuration(howl.duration() || 0);
        },
        onplay: () => {
          setIsPlaying(true);
          startProgress();
        },
        onpause: () => {
          setIsPlaying(false);
        },
        onstop: () => {
          setIsPlaying(false);
          setPosition(0);
        },
        onend: () => {
          setIsPlaying(false);
          setPosition(0);
          handleTrackEnd();
        },
      });
      howlRef.current = howl;
      if (shouldAutoplay) {
        howl.play();
      } else {
        howl.load();
        setIsPlaying(false);
      }
      onStatusChange?.(t('status.ready'));
      void api.setLastPlayed(file.path);
    } catch (err: any) {
      onStatusChange?.(err?.message ?? t('playerStatus.loadFailed'));
    }
  };

  const togglePlay = () => {
    if (!howlRef.current) return;
    if (howlRef.current.playing()) {
      howlRef.current.pause();
      setIsPlaying(false);
      return;
    }
    howlRef.current.play();
  };

  const stopPlayback = () => {
    if (!howlRef.current) return;
    howlRef.current.stop();
    setIsPlaying(false);
    setPosition(0);
  };

  const goPrev = () => {
    if (!filteredFiles.length) return;
    if (playMode === 'shuffle') {
      void selectTrack(filteredFiles[pickRandomIndex(activeIndex, filteredFiles.length)]);
      return;
    }
    const index = activeIndex === -1 ? 0 : activeIndex;
    const nextIndex = (index - 1 + filteredFiles.length) % filteredFiles.length;
    void selectTrack(filteredFiles[nextIndex]);
  };

  const goNext = () => {
    if (!filteredFiles.length) return;
    if (playMode === 'shuffle') {
      void selectTrack(filteredFiles[pickRandomIndex(activeIndex, filteredFiles.length)]);
      return;
    }
    const index = activeIndex === -1 ? -1 : activeIndex;
    const nextIndex = (index + 1) % filteredFiles.length;
    void selectTrack(filteredFiles[nextIndex]);
  };

  const seekTo = (value: number) => {
    if (!howlRef.current) return;
    howlRef.current.seek(value);
    setPosition(value);
  };

  const setSystemVolume = (value: number) => {
    const next = Math.min(100, Math.max(0, Math.round(value)));
    setVolume(next);
    if (next > 0) {
      lastVolumeRef.current = next;
    }
    void api.setSystemVolume(next);
  };

  const toggleMute = () => {
    if (volume === 0) {
      setSystemVolume(lastVolumeRef.current || 50);
      return;
    }
    setSystemVolume(0);
  };

  const cyclePlayMode = () => {
    setPlayMode((current) => {
      if (current === 'order') return 'repeat';
      if (current === 'repeat') return 'shuffle';
      return 'order';
    });
  };

  const playModeLabel = useMemo(() => {
    if (playMode === 'repeat') return t('player.playMode.repeat');
    if (playMode === 'shuffle') return t('player.playMode.shuffle');
    return t('player.playMode.order');
  }, [playMode, t]);

  useEffect(() => {
    const unsubscribePlay = EventsOn('hotkey:playpause', () => {
      if (!active && filteredFiles.length) {
        void selectTrack(filteredFiles[0]);
        return;
      }
      togglePlay();
    });
    const unsubscribeNext = EventsOn('hotkey:next', () => {
      goNext();
    });
    const unsubscribePrev = EventsOn('hotkey:prev', () => {
      goPrev();
    });
    return () => {
      unsubscribePlay();
      unsubscribeNext();
      unsubscribePrev();
    };
  }, [active, filteredFiles, goNext, goPrev, togglePlay, selectTrack]);

  return {
    active,
    isPlaying,
    duration,
    position,
    volume,
    playMode,
    playModeLabel,
    selectTrack,
    togglePlay,
    stopPlayback,
    goPrev,
    goNext,
    seekTo,
    setSystemVolume,
    toggleMute,
    cyclePlayMode,
  };
}
