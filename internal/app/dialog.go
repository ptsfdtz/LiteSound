package app

import (
	"strings"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

func (a *App) PickMusicDir(current string) (string, error) {
	dir := strings.TrimSpace(current)
	if dir == "" {
		resolved, err := a.resolveMusicDirs()
		if err == nil && len(resolved) > 0 {
			dir = resolved[0]
		}
	}
	return runtime.OpenDirectoryDialog(a.ctx, runtime.OpenDialogOptions{
		Title:            "Select Music Folder",
		DefaultDirectory: dir,
	})
}
