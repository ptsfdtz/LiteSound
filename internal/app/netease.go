package app

import "LiteSound/internal/state"

func (a *App) GetNeteaseConfig() (state.NeteaseConfig, error) {
	if a.store == nil {
		return state.NeteaseConfig{}, nil
	}
	return a.store.GetNeteaseConfig()
}

func (a *App) SetNeteaseConfig(config state.NeteaseConfig) (state.NeteaseConfig, error) {
	if a.store == nil {
		return state.NeteaseConfig{}, nil
	}
	return a.store.SetNeteaseConfig(config)
}
