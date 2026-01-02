package main

import (
	"errors"
	"path/filepath"
	"strings"
)

type Playlist struct {
	Name   string   `json:"name"`
	Tracks []string `json:"tracks"`
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
