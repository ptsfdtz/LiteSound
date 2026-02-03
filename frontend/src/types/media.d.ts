export type MusicFile = {
  name: string;
  path: string;
  ext: string;
  composer: string;
  album: string;
};

export type Playlist = {
  name: string;
  tracks: string[];
};

export type PlayMode = 'order' | 'repeat' | 'shuffle';
