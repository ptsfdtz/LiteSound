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
	dirs, err := a.resolveMusicDirs()
	if err != nil {
		return "", err
	}
	if len(dirs) == 0 {
		return "", nil
	}
	return dirs[0], nil
}

func (a *App) resolveMusicDirs() ([]string, error) {
	state, err := a.loadState()
	if err != nil {
		return nil, err
	}
	if len(state.MusicDirs) > 0 {
		return state.MusicDirs, nil
	}
	if strings.TrimSpace(state.MusicDir) != "" {
		return []string{state.MusicDir}, nil
	}
	dir, err := defaultMusicDir()
	if err != nil {
		return nil, err
	}
	return []string{dir}, nil
}

func (a *App) GetMusicDir() string {
	dir, err := a.resolveMusicDir()
	if err != nil {
		return ""
	}
	return dir
}

func (a *App) GetMusicDirs() ([]string, error) {
	return a.resolveMusicDirs()
}

func (a *App) SetMusicDir(path string) (string, error) {
	dirs, err := a.SetMusicDirs([]string{path})
	if err != nil {
		return "", err
	}
	if len(dirs) == 0 {
		return a.GetMusicDir(), nil
	}
	return dirs[0], nil
}

func (a *App) SetMusicDirs(paths []string) ([]string, error) {
	cleaned := make([]string, 0, len(paths))
	seen := make(map[string]struct{})
	for _, raw := range paths {
		trimmed := strings.TrimSpace(raw)
		if trimmed == "" {
			continue
		}
		abs, err := filepath.Abs(trimmed)
		if err != nil {
			return nil, err
		}
		info, err := os.Stat(abs)
		if err != nil {
			return nil, err
		}
		if !info.IsDir() {
			return nil, errors.New("path is not a directory")
		}
		if _, ok := seen[abs]; ok {
			continue
		}
		seen[abs] = struct{}{}
		cleaned = append(cleaned, abs)
	}
	state, err := a.loadState()
	if err != nil {
		return nil, err
	}
	if len(cleaned) == 0 {
		state.MusicDir = ""
		state.MusicDirs = []string{}
		if err := a.saveState(state); err != nil {
			return nil, err
		}
		return a.resolveMusicDirs()
	}
	state.MusicDir = ""
	state.MusicDirs = cleaned
	if err := a.saveState(state); err != nil {
		return nil, err
	}
	return cleaned, nil
}

func (a *App) ListMusicFiles() ([]MusicFile, error) {
	dirs, err := a.resolveMusicDirs()
	if err != nil {
		return nil, err
	}
	if len(dirs) == 0 {
		return nil, errors.New("music directory not found")
	}
	entries := make([]MusicFile, 0)
	seen := make(map[string]struct{})

	for _, dir := range dirs {
		if dir == "" {
			continue
		}
		if _, statErr := os.Stat(dir); statErr != nil {
			return nil, statErr
		}
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
			abs, err := filepath.Abs(path)
			if err != nil {
				return err
			}
			if _, ok := seen[abs]; ok {
				return nil
			}
			seen[abs] = struct{}{}
			composer, album := readAudioMetadata(path)
			entries = append(entries, MusicFile{
				Name:     d.Name(),
				Path:     abs,
				Ext:      ext,
				Composer: composer,
				Album:    album,
			})
			return nil
		})
		if err != nil {
			return nil, err
		}
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

	dirs, err := a.resolveMusicDirs()
	if err != nil {
		return nil, err
	}
	absFile, err := filepath.Abs(path)
	if err != nil {
		return nil, err
	}

	if !isPathWithinAnyDir(dirs, absFile) {
		return nil, errors.New("file not in music directory")
	}

	return os.ReadFile(absFile)
}
