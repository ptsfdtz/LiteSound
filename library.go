package main

import (
	"errors"
	"os"
	"path/filepath"
	"sort"
	"strings"
)

func defaultMusicDir() (string, error) {
	home, err := os.UserHomeDir()
	if err != nil {
		return "", err
	}
	return filepath.Join(home, "Music"), nil
}

var allowedAudioExt = map[string]string{
	".mp3":  "audio/mpeg",
	".flac": "audio/flac",
	".wav":  "audio/wav",
	".ogg":  "audio/ogg",
	".m4a":  "audio/mp4",
	".aac":  "audio/aac",
}

type MusicFile struct {
	Name     string `json:"name"`
	Path     string `json:"path"`
	Ext      string `json:"ext"`
	Composer string `json:"composer"`
	Album    string `json:"album"`
}

func (a *App) resolveMusicDir() (string, error) {
	state, err := a.loadState()
	if err != nil {
		return "", err
	}
	if strings.TrimSpace(state.MusicDir) != "" {
		return state.MusicDir, nil
	}
	return defaultMusicDir()
}

func (a *App) GetMusicDir() string {
	dir, err := a.resolveMusicDir()
	if err != nil {
		return ""
	}
	return dir
}

func (a *App) SetMusicDir(path string) (string, error) {
	trimmed := strings.TrimSpace(path)
	if trimmed == "" {
		state, err := a.loadState()
		if err != nil {
			return "", err
		}
		state.MusicDir = ""
		if err := a.saveState(state); err != nil {
			return "", err
		}
		return a.GetMusicDir(), nil
	}
	info, err := os.Stat(trimmed)
	if err != nil {
		return "", err
	}
	if !info.IsDir() {
		return "", errors.New("path is not a directory")
	}
	state, err := a.loadState()
	if err != nil {
		return "", err
	}
	state.MusicDir = trimmed
	if err := a.saveState(state); err != nil {
		return "", err
	}
	return trimmed, nil
}

func (a *App) ListMusicFiles() ([]MusicFile, error) {
	dir, err := a.resolveMusicDir()
	if err != nil {
		return nil, err
	}
	if dir == "" {
		return nil, errors.New("music directory not found")
	}
	if _, statErr := os.Stat(dir); statErr != nil {
		return nil, statErr
	}
	entries := make([]MusicFile, 0)

	err = filepath.WalkDir(dir, func(path string, d os.DirEntry, walkErr error) error {
		if walkErr != nil {
			return walkErr
		}
		if d.IsDir() {
			return nil
		}
		ext := strings.ToLower(filepath.Ext(d.Name()))
		if _, ok := allowedAudioExt[ext]; !ok {
			return nil
		}
		composer, album := readAudioMetadata(path)
		entries = append(entries, MusicFile{
			Name:     d.Name(),
			Path:     path,
			Ext:      ext,
			Composer: composer,
			Album:    album,
		})
		return nil
	})
	if err != nil {
		return nil, err
	}

	sort.Slice(entries, func(i, j int) bool {
		return strings.ToLower(entries[i].Name) < strings.ToLower(entries[j].Name)
	})

	return entries, nil
}

func (a *App) ReadMusicFile(path string) ([]byte, error) {
	if path == "" {
		return nil, errors.New("path is required")
	}
	ext := strings.ToLower(filepath.Ext(path))
	if _, ok := allowedAudioExt[ext]; !ok {
		return nil, errors.New("unsupported audio type")
	}

	dir, err := a.resolveMusicDir()
	if err != nil {
		return nil, err
	}
	absDir, err := filepath.Abs(dir)
	if err != nil {
		return nil, err
	}
	absFile, err := filepath.Abs(path)
	if err != nil {
		return nil, err
	}

	if !isPathWithinDir(absDir, absFile) {
		return nil, errors.New("file not in music directory")
	}

	return os.ReadFile(absFile)
}
