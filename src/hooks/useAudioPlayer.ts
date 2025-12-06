import { useState, useEffect, useCallback } from 'react';
import type { Track } from '../types';

type UseAudioPlayerProps = {
  tracks: Track[];
  initialIndex?: number;
  initialVolume?: number;
};

/**
 * 音频播放器 Hook
 * @param props 配置选项
 * @returns 播放器状态和控制方法
 */
export function useAudioPlayer({ tracks, initialIndex = 0, initialVolume = 68 }: UseAudioPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(initialVolume);
  const [isPlaying, setIsPlaying] = useState(false);

  const currentTrack = tracks[currentIndex];

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? tracks.length - 1 : prev - 1));
    setProgress(0);
  }, [tracks.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % tracks.length);
    setProgress(0);
  }, [tracks.length]);

  const handleSelectTrack = useCallback((index: number) => {
    setCurrentIndex(index);
    setProgress(0);
  }, []);

  const handleTogglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const handleVolumeChange = useCallback((newVolume: number) => {
    setVolume(newVolume);
  }, []);

  const handleProgressChange = useCallback((newProgress: number) => {
    setProgress(newProgress);
  }, []);

  // TODO: 在未来集成真实的音频播放逻辑
  useEffect(() => {
    if (isPlaying) {
      // 模拟播放进度更新
      const interval = setInterval(() => {
        setProgress((prev) => (prev >= 100 ? 0 : prev + 1));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isPlaying]);

  return {
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
  };
}
