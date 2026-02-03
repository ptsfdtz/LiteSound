package app

import "LiteSound/internal/state"

func (a *App) GetPlaylists() ([]state.Playlist, error) {
	if a.store == nil {
		return nil, nil
	}
	return a.store.GetPlaylists()
}

func (a *App) CreatePlaylist(name string) error {
	if a.store == nil {
		return nil
	}
	return a.store.CreatePlaylist(name)
}

func (a *App) AddToPlaylist(name string, path string) error {
	if a.store == nil {
		return nil
	}
	return a.store.AddToPlaylist(name, path)
}

func (a *App) RemoveFromPlaylist(name string, path string) error {
	if a.store == nil {
		return nil
	}
	return a.store.RemoveFromPlaylist(name, path)
}

func (a *App) DeletePlaylist(name string) error {
	if a.store == nil {
		return nil
	}
	return a.store.DeletePlaylist(name)
}
