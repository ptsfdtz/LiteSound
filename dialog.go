package main

import (
	"strings"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

func (a *App) PickMusicDir(current string) (string, error) {
	dir := strings.TrimSpace(current)
	if dir == "" {
		resolved, err := a.resolveMusicDir()
		if err == nil {
			dir = resolved
		}
	}
	return runtime.OpenDirectoryDialog(a.ctx, runtime.OpenDialogOptions{
		Title:            "Select Music Folder",
		DefaultDirectory: dir,
	})
}
