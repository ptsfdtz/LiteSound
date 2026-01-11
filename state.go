package main

import (
	"encoding/json"
	"errors"
	"os"
	"path/filepath"
	"strings"
)

type appState struct {
	LastPlayedPath string     `json:"lastPlayedPath"`
	ComposerFilter string     `json:"composerFilter"`
	AlbumFilter    string     `json:"albumFilter"`
	Theme          string     `json:"theme"`
	MusicDir       string     `json:"musicDir"`
	MusicDirs      []string   `json:"musicDirs"`
	Playlists      []Playlist `json:"playlists"`
	ActivePlaylist string     `json:"activePlaylist"`
}


func (a *App) GetActivePlaylist() (string, error) {
	state, err := a.loadState()
	if err != nil {
		return "", err
	}
	return state.ActivePlaylist, nil
}

func (a *App) SetActivePlaylist(name string) error {
	name = strings.TrimSpace(name)
	state, err := a.loadState()
	if err != nil {
		return err
	}
	if name == "" {
		state.ActivePlaylist = ""
		return a.saveState(state)
	}
	for _, playlist := range state.Playlists {
		if strings.EqualFold(playlist.Name, name) {
			state.ActivePlaylist = playlist.Name
			return a.saveState(state)
		}
	}
	return errors.New("playlist not found")
}

func (a *App) GetLastPlayed() (string, error) {
	state, err := a.loadState()
	if err != nil {
		return "", err
	}
	if state.LastPlayedPath == "" {
		return "", nil
	}
	return state.LastPlayedPath, nil
}

func (a *App) SetLastPlayed(path string) error {
	if path == "" {
		return errors.New("path is required")
	}
	ext := strings.ToLower(filepath.Ext(path))
	if _, ok := allowedAudioExt[ext]; !ok {
		return errors.New("unsupported audio type")
	}
	dirs, err := a.resolveMusicDirs()
	if err != nil {
		return err
	}
	absFile, err := filepath.Abs(path)
	if err != nil {
		return err
	}
	if !isPathWithinAnyDir(dirs, absFile) {
		return errors.New("file not in music directory")
	}
	state, err := a.loadState()
	if err != nil {
		return err
	}
	state.LastPlayedPath = absFile
	return a.saveState(state)
}

func (a *App) GetFilters() (string, string, error) {
	state, err := a.loadState()
	if err != nil {
		return "", "", err
	}
	return state.ComposerFilter, state.AlbumFilter, nil
}

func (a *App) SetFilters(composer string, album string) error {
	state, err := a.loadState()
	if err != nil {
		return err
	}
	state.ComposerFilter = composer
	state.AlbumFilter = album
	return a.saveState(state)
}

func (a *App) stateFilePath() (string, error) {
	configDir, err := os.UserConfigDir()
	if err != nil {
		return "", err
	}
	dir := filepath.Join(configDir, "LiteSound")
	return filepath.Join(dir, "state.json"), nil
}

func (a *App) loadState() (appState, error) {
	state := appState{}
	statePath, err := a.stateFilePath()
	if err != nil {
		return state, err
	}
	data, err := os.ReadFile(statePath)
	if err != nil {
		if os.IsNotExist(err) {
			return state, nil
		}
		return state, err
	}
	if len(data) == 0 {
		return state, nil
	}
	if err := json.Unmarshal(data, &state); err != nil {
		return appState{}, err
	}
	if state.Playlists == nil {
		state.Playlists = []Playlist{}
	}
	ensureFavoritesPlaylist(&state)
	if state.MusicDirs == nil {
		state.MusicDirs = []string{}
	}
	if len(state.MusicDirs) == 0 && strings.TrimSpace(state.MusicDir) != "" {
		state.MusicDirs = []string{state.MusicDir}
	}
	if strings.TrimSpace(state.Theme) == "" {
		state.Theme = "system"
	}
	return state, nil
}

func (a *App) saveState(state appState) error {
	statePath, err := a.stateFilePath()
	if err != nil {
		return err
	}
	if err := os.MkdirAll(filepath.Dir(statePath), 0o755); err != nil {
		return err
	}
	data, err := json.MarshalIndent(state, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(statePath, data, 0o644)
}
