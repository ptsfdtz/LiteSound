package app

import (
	"context"

	wailsruntime "github.com/wailsapp/wails/v2/pkg/runtime"
)

// App struct
type App struct {
	ctx           context.Context
	streamServer  *StreamServer
	streamBaseURL string
	tray          *trayMenu
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{tray: newTrayMenu()}
}

func Startup(a *App, ctx context.Context) {
	if a == nil {
		return
	}
	a.startup(ctx)
}

func Shutdown(a *App, ctx context.Context) {
	if a == nil {
		return
	}
	a.shutdown(ctx)
}

func BringToFront(a *App) {
	if a == nil || a.ctx == nil {
		return
	}
	wailsruntime.Show(a.ctx)
	wailsruntime.WindowUnminimise(a.ctx)
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
	server, err := StartStreamServer(a.resolveMusicDirs)
	if err == nil {
		a.streamServer = server
		a.streamBaseURL = server.BaseURL()
	}
	startHotkeys(a)
	a.startTray()
	if theme, err := a.GetTheme(); err == nil {
		a.applyTheme(theme)
	}
}

func (a *App) GetStreamBaseURL() string {
	return a.streamBaseURL
}

func (a *App) shutdown(ctx context.Context) {
	if a.streamServer == nil {
		return
	}
	_ = a.streamServer.Close(ctx)
	stopHotkeys()
}
