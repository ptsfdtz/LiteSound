package library

import (
	"errors"
	"os"
	"path/filepath"
	"sort"
	"strings"

	"LiteSound/internal/media"
	"LiteSound/internal/state"
)

type Service struct {
	store *state.Store
}

func New(store *state.Store) *Service {
	return &Service{store: store}
}

func (s *Service) ListMusicFiles() ([]media.MusicFile, error) {
	dirs, err := s.store.ResolveMusicDirs()
	if err != nil {
		return nil, err
	}
	if len(dirs) == 0 {
		return nil, errors.New("music directory not found")
	}
	entries := make([]media.MusicFile, 0)
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
			if _, ok := media.AllowedAudioExt[ext]; !ok {
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
			composer, album := media.ReadAudioMetadata(path)
			entries = append(entries, media.MusicFile{
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

func (s *Service) ReadMusicFile(path string) ([]byte, error) {
	if path == "" {
		return nil, errors.New("path is required")
	}
	if !media.IsAllowedAudio(path) {
		return nil, errors.New("unsupported audio type")
	}

	dirs, err := s.store.ResolveMusicDirs()
	if err != nil {
		return nil, err
	}
	absFile, err := filepath.Abs(path)
	if err != nil {
		return nil, err
	}

	if !media.IsPathWithinAnyDir(dirs, absFile) {
		return nil, errors.New("file not in music directory")
	}

	return os.ReadFile(absFile)
}
