package app

import "LiteSound/internal/system"

func (a *App) GetSystemVolume() int {
	return system.GetSystemVolume()
}

func (a *App) SetSystemVolume(value int) int {
	return system.SetSystemVolume(value)
}
