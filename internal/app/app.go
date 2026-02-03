package app

import (
	"context"

	"LiteSound/internal/library"
	"LiteSound/internal/media"
	"LiteSound/internal/state"
	"LiteSound/internal/system"
	wailsruntime "github.com/wailsapp/wails/v2/pkg/runtime"
)

// App struct
type App struct {
	ctx           context.Context
	store         *state.Store
	library       *library.Service
	streamServer  *media.StreamServer
	streamBaseURL string
	tray          *system.Tray
}

// NewApp creates a new App application struct
func NewApp() *App {
	store := state.NewStore("LiteSound")
	return &App{
		store:   store,
		library: library.New(store),
		tray:    system.NewTray(),
	}
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
	server, err := media.StartStreamServer(a.store.ResolveMusicDirs)
	if err == nil {
		a.streamServer = server
		a.streamBaseURL = server.BaseURL()
	}
	system.StartHotkeys(a.ctx)
	if a.tray != nil {
		a.tray.Start(a.ctx)
	}
	if theme, err := a.store.GetTheme(); err == nil {
		system.ApplyTheme(a.ctx, theme)
	}
}

func (a *App) GetStreamBaseURL() string {
	return a.streamBaseURL
}

func (a *App) shutdown(ctx context.Context) {
	system.StopHotkeys()
	if a.streamServer == nil {
		return
	}
	_ = a.streamServer.Close(ctx)
}
