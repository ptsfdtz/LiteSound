import {
    AddToPlaylist,
    CreatePlaylist,
    GetFilters,
    GetLastPlayed,
    GetMusicDir,
    GetPlaylists,
    ListMusicFiles,
    ReadMusicFile,
    SetFilters,
    SetLastPlayed,
} from '../../wailsjs/go/main/App';

export const api = {
    addToPlaylist: AddToPlaylist,
    createPlaylist: CreatePlaylist,
    getFilters: GetFilters,
    getLastPlayed: GetLastPlayed,
    getMusicDir: GetMusicDir,
    getPlaylists: GetPlaylists,
    listMusicFiles: ListMusicFiles,
    readMusicFile: ReadMusicFile,
    setFilters: SetFilters,
    setLastPlayed: SetLastPlayed,
};
