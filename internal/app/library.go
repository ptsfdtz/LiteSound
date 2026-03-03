package app

import (
	"errors"
	"net/url"
	"strings"

	"LiteSound/internal/media"
)

func (a *App) GetMusicDir() string {
	if a.store == nil {
		return ""
	}
	dir, err := a.store.GetMusicDir()
	if err != nil {
		return ""
	}
	return dir
}

func (a *App) GetMusicDirs() ([]string, error) {
	if a.store == nil {
		return nil, nil
	}
	return a.store.ResolveMusicDirs()
}

func (a *App) SetMusicDir(path string) (string, error) {
	if a.store == nil {
		return "", nil
	}
	return a.store.SetMusicDir(path)
}

func (a *App) SetMusicDirs(paths []string) ([]string, error) {
	if a.store == nil {
		return nil, nil
	}
	return a.store.SetMusicDirs(paths)
}

func (a *App) ListMusicFiles() ([]media.MusicFile, error) {
	if a.library == nil {
		return nil, nil
	}
	return a.library.ListMusicFiles()
}

func (a *App) ReadMusicFile(path string) ([]byte, error) {
	if a.library == nil {
		return nil, nil
	}
	return a.library.ReadMusicFile(path)
}

func (a *App) GetPlaybackURL(path string) (string, error) {
	if a.library == nil {
		return "", errors.New("library unavailable")
	}
	if songID, _, ok := media.ParseNeteaseCloudPath(path); ok {
		return a.library.ResolveNeteaseSongURL(songID)
	}
	if strings.TrimSpace(a.streamBaseURL) == "" {
		return "", errors.New("stream server unavailable")
	}
	baseURL, err := url.Parse(a.streamBaseURL)
	if err != nil {
		return "", err
	}
	baseURL.Path = "/media"
	query := baseURL.Query()
	query.Set("path", path)
	baseURL.RawQuery = query.Encode()
	return baseURL.String(), nil
}
