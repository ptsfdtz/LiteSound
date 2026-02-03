package app

func (a *App) GetActivePlaylist() (string, error) {
	if a.store == nil {
		return "", nil
	}
	return a.store.GetActivePlaylist()
}

func (a *App) SetActivePlaylist(name string) error {
	if a.store == nil {
		return nil
	}
	return a.store.SetActivePlaylist(name)
}

func (a *App) GetLastPlayed() (string, error) {
	if a.store == nil {
		return "", nil
	}
	return a.store.GetLastPlayed()
}

func (a *App) SetLastPlayed(path string) error {
	if a.store == nil {
		return nil
	}
	return a.store.SetLastPlayed(path)
}

func (a *App) GetFilters() (string, string, error) {
	if a.store == nil {
		return "", "", nil
	}
	return a.store.GetFilters()
}

func (a *App) SetFilters(composer string, album string) error {
	if a.store == nil {
		return nil
	}
	return a.store.SetFilters(composer, album)
}
