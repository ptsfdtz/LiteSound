package main

import (
	"errors"
	"strings"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

func (a *App) GetTheme() (string, error) {
	state, err := a.loadState()
	if err != nil {
		return "system", err
	}
	if strings.TrimSpace(state.Theme) == "" {
		return "system", nil
	}
	return state.Theme, nil
}

func (a *App) SetTheme(theme string) error {
	normalized := strings.ToLower(strings.TrimSpace(theme))
	switch normalized {
	case "", "system":
		normalized = "system"
	case "light", "dark":
	default:
		return errors.New("invalid theme")
	}
	state, err := a.loadState()
	if err != nil {
		return err
	}
	state.Theme = normalized
	if err := a.saveState(state); err != nil {
		return err
	}
	a.applyTheme(normalized)
	return nil
}

func (a *App) applyTheme(theme string) {
	if a.ctx == nil {
		return
	}
	switch theme {
	case "light":
		runtime.WindowSetLightTheme(a.ctx)
	case "dark":
		runtime.WindowSetDarkTheme(a.ctx)
	default:
		runtime.WindowSetSystemDefaultTheme(a.ctx)
	}
}
