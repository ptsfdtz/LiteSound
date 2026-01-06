package main

import (
	"embed"
	"runtime"
	"sync"

	"github.com/getlantern/systray"
	wailsruntime "github.com/wailsapp/wails/v2/pkg/runtime"
)

//go:embed build/appicon.png build/windows/icon.ico
var trayIcons embed.FS

var trayOnce sync.Once

func (a *App) startTray() {
	trayOnce.Do(func() {
		go func() {
			runtime.LockOSThread()
			systray.Run(func() { a.onTrayReady() }, func() {})
		}()
	})
}

func (a *App) onTrayReady() {
	icon := a.trayIcon()
	if len(icon) > 0 {
		systray.SetIcon(icon)
		if runtime.GOOS == "darwin" {
			systray.SetTemplateIcon(icon, icon)
		}
	}
	systray.SetTooltip("LiteSound")

	showItem := systray.AddMenuItem("Show", "Show LiteSound")
	hideItem := systray.AddMenuItem("Hide", "Hide LiteSound")
	systray.AddSeparator()
	quitItem := systray.AddMenuItem("Quit", "Quit LiteSound")

	go func() {
		for {
			select {
			case <-showItem.ClickedCh:
				wailsruntime.Show(a.ctx)
				wailsruntime.WindowUnminimise(a.ctx)
			case <-hideItem.ClickedCh:
				wailsruntime.Hide(a.ctx)
			case <-quitItem.ClickedCh:
				wailsruntime.Quit(a.ctx)
				return
			}
		}
	}()
}

func (a *App) trayIcon() []byte {
	var path string
	if runtime.GOOS == "windows" {
		path = "build/windows/icon.ico"
	} else {
		path = "build/appicon.png"
	}
	data, err := trayIcons.ReadFile(path)
	if err != nil {
		return nil
	}
	return data
}
