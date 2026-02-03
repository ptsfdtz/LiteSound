package app

func (a *App) UpdateTrayPlayback(track string, isPlaying bool, playMode string) {
	if a.tray == nil {
		return
	}
	a.tray.UpdatePlayback(track, isPlaying, playMode)
}
