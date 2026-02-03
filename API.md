# API Reference

This is a developer-facing overview of the Wails APIs exposed by the backend. The TypeScript bindings are generated under `frontend/wailsjs/go/app/App.d.ts`.

## Library
- `ListMusicFiles(): Promise<MusicFile[]>` - Scan music folders and return metadata.
- `ReadMusicFile(path: string): Promise<number[]>` - Read file data (used by the stream server).
- `GetStreamBaseURL(): Promise<string>` - Base URL for local streaming server.

## Music folders
- `GetMusicDir(): Promise<string>` - Get primary music folder.
- `GetMusicDirs(): Promise<string[]>` - Get all configured music folders.
- `SetMusicDir(path: string): Promise<string>` - Set primary music folder.
- `SetMusicDirs(paths: string[]): Promise<string[]>` - Set multiple music folders.
- `PickMusicDir(path: string): Promise<string>` - Open folder picker.

## Playback state
- `GetLastPlayed(): Promise<string>` - Get last played track path.
- `GetLastPlayedRecord(): Promise<{ path: string; playedAt: number }>` - Get last played track and timestamp.
- `SetLastPlayed(path: string): Promise<void>` - Persist last played track path.
- `GetActivePlaylist(): Promise<string>` - Get active playlist name.
- `SetActivePlaylist(name: string): Promise<void>` - Persist active playlist name.
- `GetFilters(): Promise<string>` - Get saved composer/album filters.
- `SetFilters(composer: string, album: string): Promise<void>` - Persist filters.

## Playlists
- `GetPlaylists(): Promise<Playlist[]>` - Get all playlists.
- `CreatePlaylist(name: string): Promise<void>` - Create a new playlist.
- `DeletePlaylist(name: string): Promise<void>` - Delete a playlist.
- `AddToPlaylist(name: string, path: string): Promise<void>` - Add track to playlist.
- `RemoveFromPlaylist(name: string, path: string): Promise<void>` - Remove track from playlist.

## Theme and volume
- `GetTheme(): Promise<string>` - Get theme mode (`light`, `dark`, `system`).
- `SetTheme(theme: string): Promise<void>` - Set theme mode.
- `GetSystemVolume(): Promise<number>` - Get system volume (0-100).
- `SetSystemVolume(value: number): Promise<number>` - Set system volume.

## Tray
- `UpdateTrayPlayback(track: string, isPlaying: boolean, playMode: string): Promise<void>` - Update tray menu labels and state.
