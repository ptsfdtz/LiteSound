import type { Track } from '../types';

/**
 * 示例音轨数据
 */
export const SAMPLE_TRACKS: Track[] = [
  { title: 'Quiet Light', artist: 'Amber Field', duration: '3:42' },
  { title: 'Lines', artist: 'North Pier', duration: '4:15' },
  { title: 'Still Air', artist: 'Yana Bloom', duration: '3:08' },
  { title: 'Palette', artist: 'Glass Low', duration: '2:56' },
];

/**
 * 示例播放列表
 */
export const SAMPLE_PLAYLISTS = ['Favorites', 'Focus', 'Daily Mix', 'Downloads'];

/**
 * 播放列表曲目数据
 */
export const PLAYLIST_TRACKS: Record<string, Track[]> = {
  Favorites: [
    {
      title: 'Quiet Light',
      artist: 'Amber Field',
      duration: '3:42',
      album: 'Morning Light',
      lyrics: [
        '十月的阳光高照 在我睡不了的床上',
        '你只是为我盖　盖被子就走了 可那只是一场梦',
        '我以为有永不褪去的幸福留在我身旁',
        '却只有你洗净叠好的衣裳 放在我枕旁',
      ],
    },
    {
      title: 'Lines',
      artist: 'North Pier',
      duration: '4:15',
      album: 'Horizon',
      lyrics: [
        '我也只能站在街头想看你各方的后背',
        '是否你的无知闲理想带你去过天堂',
        '我也只能在梦里朝你挥挥手',
        '我要回去找我那消失的那份 孤独',
      ],
    },
    {
      title: 'Still Air',
      artist: 'Yana Bloom',
      duration: '3:08',
      album: 'Still Air EP',
      lyrics: [
        '十月的阳光高照 在我睡不了的床上',
        '你也只是为我盖　盖被子就走了 可那只是一场梦',
        '我以为有永不褪去的幸福留在我身旁',
        '如只有你洗净叠好的衣裳 放在我枕旁',
      ],
    },
    {
      title: 'Palette',
      artist: 'Glass Low',
      duration: '2:56',
      album: 'Colors',
      lyrics: [
        '和声：居宇/旭乐',
        '十月的阳光高照 在我睡不了的床上',
        '你只是为我盖　盖被子就走了 可那只是一场梦',
        '我以为有永不褪去的幸福留在我身旁',
      ],
    },
    {
      title: 'Distant Echo',
      artist: 'Amber Field',
      duration: '4:02',
      album: 'Morning Light',
      lyrics: [
        '十月的阳光高照 在我睡不了的床上',
        '你只是为我盖　盖被子就走了 可那只是一场梦',
        '我以为有永不褪去的幸福留在我身旁',
        '却只有你洗净叠好的衣裳 放在我枕旁',
      ],
    },
    {
      title: 'Waves',
      artist: 'North Pier',
      duration: '3:35',
      album: 'Horizon',
      lyrics: [
        '我也只能站在街头想看你各方的后背',
        '是否你的无知闲理想带你去过天堂',
        '我也只能在梦里朝你挥挥手',
        '我要回去找我那消失的那份 孤独',
      ],
    },
  ],
  Focus: [
    {
      title: 'Deep Focus',
      artist: 'Echo Wave',
      duration: '4:32',
      album: 'Concentration',
      lyrics: [
        '十月的阳光高照 在我睡不了的床上',
        '你只是为我盖　盖被子就走了 可那只是一场梦',
        '我以为有永不褪去的幸福留在我身旁',
        '却只有你洗净叠好的衣裳 放在我枕旁',
      ],
    },
    {
      title: 'Concentration',
      artist: 'Mind Flow',
      duration: '3:58',
      album: 'Focus Zone',
      lyrics: [
        '我也只能站在街头想看你各方的后背',
        '是否你的无知闲理想带你去过天堂',
        '我也只能在梦里朝你挥挥手',
        '我要回去找我那消失的那份 孤独',
      ],
    },
    {
      title: 'Study Time',
      artist: 'Calm Beats',
      duration: '4:21',
      album: 'Study Session',
      lyrics: [
        '十月的阳光高照 在我睡不了的床上',
        '你只是为我盖　盖被子就走了 可那只是一场梦',
        '我以为有永不褪去的幸福留在我身旁',
        '却只有你洗净叠好的衣裳 放在我枕旁',
      ],
    },
    {
      title: 'Mental Clarity',
      artist: 'Echo Wave',
      duration: '3:45',
      album: 'Concentration',
      lyrics: [
        '和声：居宇/旭乐',
        '十月的阳光高照 在我睡不了的床上',
        '你只是为我盖　盖被子就走了 可那只是一场梦',
        '我以为有永不褪去的幸福留在我身旁',
      ],
    },
  ],
  'Daily Mix': [
    {
      title: 'Morning Brew',
      artist: 'Sunrise Set',
      duration: '3:15',
      album: 'Daily Rhythms',
      lyrics: [
        '十月的阳光高照 在我睡不了的床上',
        '你只是为我盖　盖被子就走了 可那只是一场梦',
        '我以为有永不褪去的幸福留在我身旁',
        '却只有你洗净叠好的衣裳 放在我枕旁',
      ],
    },
    {
      title: 'Afternoon Vibe',
      artist: 'Day Light',
      duration: '3:47',
      album: 'Daytime',
      lyrics: [
        '我也只能站在街头想看你各方的后背',
        '是否你的无知闲理想带你去过天堂',
        '我也只能在梦里朝你挥挥手',
        '我要回去找我那消失的那份 孤独',
      ],
    },
    {
      title: 'Evening Chill',
      artist: 'Sunset Dreams',
      duration: '4:05',
      album: 'Evening Moods',
      lyrics: [
        '十月的阳光高照 在我睡不了的床上',
        '你只是为我盖　盖被子就走了 可那只是一场梦',
        '我以为有永不褪去的幸福留在我身旁',
        '却只有你洗净叠好的衣裳 放在我枕旁',
      ],
    },
    {
      title: 'Night Rhythm',
      artist: 'Moon Glow',
      duration: '3:28',
      album: 'Nightfall',
      lyrics: [
        '和声：居宇/旭乐',
        '十月的阳光高照 在我睡不了的床上',
        '你只是为我盖　盖被子就走了 可那只是一场梦',
        '我以为有永不褪去的幸福留在我身旁',
      ],
    },
    {
      title: 'Sunrise',
      artist: 'Day Light',
      duration: '3:52',
      album: 'Daytime',
      lyrics: [
        '十月的阳光高照 在我睡不了的床上',
        '你只是为我盖　盖被子就走了 可那只是一场梦',
        '我以为有永不褪去的幸福留在我身旁',
        '却只有你洗净叠好的衣裳 放在我枕旁',
      ],
    },
  ],
  Downloads: [
    {
      title: 'Downloaded Track 1',
      artist: 'Local Artist',
      duration: '3:33',
      album: 'Local Sounds',
      lyrics: [
        '十月的阳光高照 在我睡不了的床上',
        '你只是为我盖　盖被子就走了 可那只是一场梦',
        '我以为有永不褪去的幸福留在我身旁',
        '却只有你洗净叠好的衣裳 放在我枕旁',
      ],
    },
    {
      title: 'Downloaded Track 2',
      artist: 'Indie Band',
      duration: '4:12',
      album: 'Underground',
      lyrics: [
        '我也只能站在街头想看你各方的后背',
        '是否你的无知闲理想带你去过天堂',
        '我也只能在梦里朝你挥挥手',
        '我要回去找我那消失的那份 孤独',
      ],
    },
    {
      title: 'Acoustic Session',
      artist: 'Local Artist',
      duration: '2:58',
      album: 'Local Sounds',
      lyrics: [
        '十月的阳光高照 在我睡不了的床上',
        '你只是为我盖　盖被子就走了 可那只是一场梦',
        '我以为有永不褪去的幸福留在我身旁',
        '却只有你洗净叠好的衣裳 放在我枕旁',
      ],
    },
  ],
};

/**
 * 默认音量
 */
export const DEFAULT_VOLUME = 68;

/**
 * 默认主题
 */
export const DEFAULT_THEME = 'light' as const;
