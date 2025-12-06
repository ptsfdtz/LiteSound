/**
 * 音轨数据类型
 */
export type Track = {
  title: string;
  artist: string;
  duration: string;
  album?: string;
  cover?: string;
  lyrics?: string[];
};

/**
 * 主题类型
 */
export type Theme = 'light' | 'dark';

/**
 * 播放状态
 */
export type PlayState = {
  isPlaying: boolean;
  currentIndex: number;
  progress: number;
  volume: number;
};
