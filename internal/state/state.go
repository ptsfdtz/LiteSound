package state

import (
	"encoding/json"
	"errors"
	"os"
	"path/filepath"
	"runtime"
	"strings"
	"sync"
	"time"

	"LiteSound/internal/media"
)

const FavoritesKey = "__favorites__"

type Playlist struct {
	Name   string   `json:"name"`
	Tracks []string `json:"tracks"`
}

type State struct {
	LastPlayedPath string     `json:"lastPlayedPath"`
	LastPlayedAt   int64      `json:"lastPlayedAt"`
	ComposerFilter string     `json:"composerFilter"`
	AlbumFilter    string     `json:"albumFilter"`
	Theme          string     `json:"theme"`
	MusicDir       string     `json:"musicDir"`
	MusicDirs      []string   `json:"musicDirs"`
	Playlists      []Playlist `json:"playlists"`
	ActivePlaylist string     `json:"activePlaylist"`
}

type LastPlayedRecord struct {
	Path     string `json:"path"`
	PlayedAt int64  `json:"playedAt"`
}

type Store struct {
	appName string
	mu      sync.RWMutex
}

func NewStore(appName string) *Store {
	if strings.TrimSpace(appName) == "" {
		appName = "LiteSound"
	}
	return &Store{appName: appName}
}

func (s *Store) stateFilePath() (string, error) {
	configDir, err := os.UserConfigDir()
	if err != nil {
		return "", err
	}
	dir := filepath.Join(configDir, s.appName)
	return filepath.Join(dir, "state.json"), nil
}

func (s *Store) Load() (State, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.loadFromDisk()
}

func (s *Store) Save(state State) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	return s.saveToDisk(state)
}

func (s *Store) Update(updateFn func(*State) error) (State, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	state, err := s.loadFromDisk()
	if err != nil {
		return State{}, err
	}
	if updateFn != nil {
		if err := updateFn(&state); err != nil {
			return State{}, err
		}
	}
	if err := s.saveToDisk(state); err != nil {
		return State{}, err
	}
	return state, nil
}

func (s *Store) loadFromDisk() (State, error) {
	state := State{}
	statePath, err := s.stateFilePath()
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
		return State{}, err
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

func (s *Store) saveToDisk(state State) error {
	statePath, err := s.stateFilePath()
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
	tempFile, err := os.CreateTemp(filepath.Dir(statePath), "state-*.tmp")
	if err != nil {
		return err
	}
	tempPath := tempFile.Name()
	if _, err := tempFile.Write(data); err != nil {
		_ = tempFile.Close()
		_ = os.Remove(tempPath)
		return err
	}
	if err := tempFile.Sync(); err != nil {
		_ = tempFile.Close()
		_ = os.Remove(tempPath)
		return err
	}
	if err := tempFile.Close(); err != nil {
		_ = os.Remove(tempPath)
		return err
	}
	if err := os.Chmod(tempPath, 0o644); err != nil {
		_ = os.Remove(tempPath)
		return err
	}
	if runtime.GOOS == "windows" {
		_ = os.Remove(statePath)
	}
	if err := os.Rename(tempPath, statePath); err != nil {
		_ = os.Remove(tempPath)
		return err
	}
	return nil
}

func (s *Store) ResolveMusicDirs() ([]string, error) {
	state, err := s.Load()
	if err != nil {
		return nil, err
	}
	if len(state.MusicDirs) > 0 {
		return state.MusicDirs, nil
	}
	if strings.TrimSpace(state.MusicDir) != "" {
		return []string{state.MusicDir}, nil
	}
	dir, err := media.DefaultMusicDir()
	if err != nil {
		return nil, err
	}
	return []string{dir}, nil
}

func (s *Store) GetMusicDir() (string, error) {
	dirs, err := s.ResolveMusicDirs()
	if err != nil {
		return "", err
	}
	if len(dirs) == 0 {
		return "", nil
	}
	return dirs[0], nil
}

func (s *Store) SetMusicDir(path string) (string, error) {
	dirs, err := s.SetMusicDirs([]string{path})
	if err != nil {
		return "", err
	}
	if len(dirs) == 0 {
		return s.GetMusicDir()
	}
	return dirs[0], nil
}

func (s *Store) SetMusicDirs(paths []string) ([]string, error) {
	cleaned := make([]string, 0, len(paths))
	seen := make(map[string]struct{})
	for _, raw := range paths {
		trimmed := strings.TrimSpace(raw)
		if trimmed == "" {
			continue
		}
		abs, err := media.ResolveExistingPath(trimmed)
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
	updateFn := func(state *State) error {
		if len(cleaned) == 0 {
			state.MusicDir = ""
			state.MusicDirs = []string{}
			return nil
		}
		state.MusicDir = ""
		state.MusicDirs = cleaned
		return nil
	}
	_, err := s.Update(updateFn)
	if err != nil {
		return nil, err
	}
	if len(cleaned) == 0 {
		return s.ResolveMusicDirs()
	}
	return cleaned, nil
}

func (s *Store) GetFilters() (string, string, error) {
	state, err := s.Load()
	if err != nil {
		return "", "", err
	}
	return state.ComposerFilter, state.AlbumFilter, nil
}

func (s *Store) SetFilters(composer string, album string) error {
	_, err := s.Update(func(state *State) error {
		state.ComposerFilter = composer
		state.AlbumFilter = album
		return nil
	})
	return err
}

func (s *Store) GetLastPlayed() (string, error) {
	state, err := s.Load()
	if err != nil {
		return "", err
	}
	if state.LastPlayedPath == "" {
		return "", nil
	}
	return state.LastPlayedPath, nil
}

func (s *Store) GetLastPlayedRecord() (LastPlayedRecord, error) {
	state, err := s.Load()
	if err != nil {
		return LastPlayedRecord{}, err
	}
	if state.LastPlayedPath == "" {
		return LastPlayedRecord{}, nil
	}
	return LastPlayedRecord{
		Path:     state.LastPlayedPath,
		PlayedAt: state.LastPlayedAt,
	}, nil
}

func (s *Store) SetLastPlayed(path string) error {
	if path == "" {
		return errors.New("path is required")
	}
	if !media.IsAllowedAudio(path) {
		return errors.New("unsupported audio type")
	}
	dirs, err := s.ResolveMusicDirs()
	if err != nil {
		return err
	}
	absFile, err := media.ResolveExistingPath(path)
	if err != nil {
		return err
	}
	if !media.IsPathWithinAnyDir(dirs, absFile) {
		return errors.New("file not in music directory")
	}
	_, err = s.Update(func(state *State) error {
		state.LastPlayedPath = absFile
		state.LastPlayedAt = time.Now().UnixMilli()
		return nil
	})
	return err
}

func (s *Store) GetActivePlaylist() (string, error) {
	state, err := s.Load()
	if err != nil {
		return "", err
	}
	return state.ActivePlaylist, nil
}

func (s *Store) SetActivePlaylist(name string) error {
	name = strings.TrimSpace(name)
	_, err := s.Update(func(state *State) error {
		if name == "" {
			state.ActivePlaylist = ""
			return nil
		}
		for _, playlist := range state.Playlists {
			if strings.EqualFold(playlist.Name, name) {
				state.ActivePlaylist = playlist.Name
				return nil
			}
		}
		return errors.New("playlist not found")
	})
	return err
}

func (s *Store) GetPlaylists() ([]Playlist, error) {
	state, err := s.Load()
	if err != nil {
		return nil, err
	}
	if state.Playlists == nil {
		return []Playlist{}, nil
	}
	return state.Playlists, nil
}

func (s *Store) CreatePlaylist(name string) error {
	name = strings.TrimSpace(name)
	if name == "" {
		return errors.New("playlist name is required")
	}
	if strings.EqualFold(name, FavoritesKey) {
		return errors.New("playlist name is reserved")
	}
	_, err := s.Update(func(state *State) error {
		for _, playlist := range state.Playlists {
			if strings.EqualFold(playlist.Name, name) {
				return errors.New("playlist already exists")
			}
		}
		state.Playlists = append(state.Playlists, Playlist{Name: name, Tracks: []string{}})
		return nil
	})
	return err
}

func (s *Store) DeletePlaylist(name string) error {
	name = strings.TrimSpace(name)
	if name == "" {
		return errors.New("playlist name is required")
	}
	if strings.EqualFold(name, FavoritesKey) {
		return errors.New("playlist name is reserved")
	}
	_, err := s.Update(func(state *State) error {
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
		return nil
	})
	return err
}

func (s *Store) AddToPlaylist(name string, path string) error {
	name = strings.TrimSpace(name)
	if name == "" {
		return errors.New("playlist name is required")
	}
	if path == "" {
		return errors.New("path is required")
	}
	if !media.IsAllowedAudio(path) {
		return errors.New("unsupported audio type")
	}
	dirs, err := s.ResolveMusicDirs()
	if err != nil {
		return err
	}
	absFile, err := media.ResolveExistingPath(path)
	if err != nil {
		return err
	}
	if !media.IsPathWithinAnyDir(dirs, absFile) {
		return errors.New("file not in music directory")
	}

	_, err = s.Update(func(state *State) error {
		for i, playlist := range state.Playlists {
			if strings.EqualFold(playlist.Name, name) {
				for _, existing := range playlist.Tracks {
					if strings.EqualFold(existing, absFile) {
						return nil
					}
				}
				state.Playlists[i].Tracks = append(state.Playlists[i].Tracks, absFile)
				return nil
			}
		}
		return errors.New("playlist not found")
	})
	return err
}

func (s *Store) RemoveFromPlaylist(name string, path string) error {
	name = strings.TrimSpace(name)
	if name == "" {
		return errors.New("playlist name is required")
	}
	if path == "" {
		return errors.New("path is required")
	}
	if !media.IsAllowedAudio(path) {
		return errors.New("unsupported audio type")
	}
	dirs, err := s.ResolveMusicDirs()
	if err != nil {
		return err
	}
	absFile, err := media.ResolveExistingPath(path)
	if err != nil {
		return err
	}
	if !media.IsPathWithinAnyDir(dirs, absFile) {
		return errors.New("file not in music directory")
	}

	_, err = s.Update(func(state *State) error {
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
				return nil
			}
		}
		return errors.New("playlist not found")
	})
	return err
}

func NormalizeTheme(theme string) (string, error) {
	normalized := strings.ToLower(strings.TrimSpace(theme))
	switch normalized {
	case "", "system":
		normalized = "system"
	case "light", "dark":
	default:
		return "", errors.New("invalid theme")
	}
	return normalized, nil
}

func (s *Store) GetTheme() (string, error) {
	state, err := s.Load()
	if err != nil {
		return "system", err
	}
	if strings.TrimSpace(state.Theme) == "" {
		return "system", nil
	}
	return state.Theme, nil
}

func (s *Store) SetTheme(theme string) (string, error) {
	normalized, err := NormalizeTheme(theme)
	if err != nil {
		return "", err
	}
	_, err = s.Update(func(state *State) error {
		state.Theme = normalized
		return nil
	})
	if err != nil {
		return "", err
	}
	return normalized, nil
}

func ensureFavoritesPlaylist(state *State) {
	for _, playlist := range state.Playlists {
		if strings.EqualFold(playlist.Name, FavoritesKey) {
			return
		}
	}
	state.Playlists = append([]Playlist{{Name: FavoritesKey, Tracks: []string{}}}, state.Playlists...)
}
