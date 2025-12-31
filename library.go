package main

import (
	"errors"
	"os"
	"path/filepath"
	"sort"
	"strings"
)

const defaultMusicDir = `C:\Users\user\Music`

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

func (a *App) GetMusicDir() string {
	return defaultMusicDir
}

func (a *App) ListMusicFiles() ([]MusicFile, error) {
	dir := defaultMusicDir
	entries := make([]MusicFile, 0)

	err := filepath.WalkDir(dir, func(path string, d os.DirEntry, walkErr error) error {
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

	absDir, err := filepath.Abs(defaultMusicDir)
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
