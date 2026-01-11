package main

import (
	"errors"
	"path/filepath"
	"strings"
)

const favoritesPlaylistKey = "__favorites__"

type Playlist struct {
	Name   string   `json:"name"`
	Tracks []string `json:"tracks"`
}

func ensureFavoritesPlaylist(state *appState) {
	for _, playlist := range state.Playlists {
		if strings.EqualFold(playlist.Name, favoritesPlaylistKey) {
			return
		}
	}
	state.Playlists = append([]Playlist{{Name: favoritesPlaylistKey, Tracks: []string{}}}, state.Playlists...)
}

func (a *App) GetPlaylists() ([]Playlist, error) {
	state, err := a.loadState()
	if err != nil {
		return nil, err
	}
	if state.Playlists == nil {
		return []Playlist{}, nil
	}
	return state.Playlists, nil
}

func (a *App) CreatePlaylist(name string) error {
	name = strings.TrimSpace(name)
	if name == "" {
		return errors.New("playlist name is required")
	}
	if strings.EqualFold(name, favoritesPlaylistKey) {
		return errors.New("playlist name is reserved")
	}
	state, err := a.loadState()
	if err != nil {
		return err
	}
	for _, playlist := range state.Playlists {
		if strings.EqualFold(playlist.Name, name) {
			return errors.New("playlist already exists")
		}
	}
	state.Playlists = append(state.Playlists, Playlist{Name: name, Tracks: []string{}})
	return a.saveState(state)
}

func (a *App) AddToPlaylist(name string, path string) error {
	name = strings.TrimSpace(name)
	if name == "" {
		return errors.New("playlist name is required")
	}
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
	for i, playlist := range state.Playlists {
		if strings.EqualFold(playlist.Name, name) {
			for _, existing := range playlist.Tracks {
				if strings.EqualFold(existing, absFile) {
					return nil
				}
			}
			state.Playlists[i].Tracks = append(state.Playlists[i].Tracks, absFile)
			return a.saveState(state)
		}
	}
	return errors.New("playlist not found")
}


func (a *App) RemoveFromPlaylist(name string, path string) error {
	name = strings.TrimSpace(name)
	if name == "" {
		return errors.New("playlist name is required")
	}
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
	for i, playlist := range state.Playlists {
		if strings.EqualFold(playlist.Name, name) {
			updated := make([]string, 0, len(playlist.Tracks))
			removed := false
			for _, existing := range playlist.Tracks {
				if strings.EqualFold(existing, absFile) {
					removed = true
					continue
				}
				updated = append(updated, existing)
			}
			if !removed {
				return nil
			}
			state.Playlists[i].Tracks = updated
			return a.saveState(state)
		}
	}
	return errors.New("playlist not found")
}
func (a *App) DeletePlaylist(name string) error {
	name = strings.TrimSpace(name)
	if name == "" {
		return errors.New("playlist name is required")
	}
	if strings.EqualFold(name, favoritesPlaylistKey) {
		return errors.New("playlist name is reserved")
	}
	state, err := a.loadState()
	if err != nil {
		return err
	}
	updated := make([]Playlist, 0, len(state.Playlists))
	found := false
	for _, playlist := range state.Playlists {
		if strings.EqualFold(playlist.Name, name) {
			found = true
			continue
		}
		updated = append(updated, playlist)
	}
	if !found {
		return errors.New("playlist not found")
	}
	if strings.EqualFold(state.ActivePlaylist, name) {
		state.ActivePlaylist = ""
	}
	state.Playlists = updated
	return a.saveState(state)
}
