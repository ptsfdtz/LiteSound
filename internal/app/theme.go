package app

import "LiteSound/internal/system"

func (a *App) GetTheme() (string, error) {
	if a.store == nil {
		return "system", nil
	}
	return a.store.GetTheme()
}

func (a *App) SetTheme(theme string) error {
	if a.store == nil {
		return nil
	}
	normalized, err := a.store.SetTheme(theme)
	if err != nil {
		return err
	}
	system.ApplyTheme(a.ctx, normalized)
	return nil
}
