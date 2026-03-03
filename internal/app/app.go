package app

import (
	"context"
	"fmt"
	"runtime"
	"strings"
	"time"

	"LiteSound/internal/library"
	"LiteSound/internal/media"
	"LiteSound/internal/state"
	"LiteSound/internal/system"
	"LiteSound/internal/update"
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
	version       string
	updater       *update.Service
}

// NewApp creates a new App application struct
func NewApp(version string, updateOwner string, updateRepo string) *App {
	store := state.NewStore("LiteSound")
	return &App{
		store:   store,
		library: library.New(store),
		tray:    system.NewTray(),
		version: strings.TrimSpace(version),
		updater: update.New(updateOwner, updateRepo),
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
	go a.autoUpdateOnStartup()
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

func (a *App) autoUpdateOnStartup() {
	if a == nil || a.ctx == nil || a.updater == nil {
		return
	}
	if runtime.GOOS != "windows" {
		return
	}
	currentVersion := strings.TrimSpace(a.version)
	if currentVersion == "" || strings.EqualFold(currentVersion, "dev") {
		return
	}

	// Delay startup check to avoid competing with initial window rendering.
	time.Sleep(3 * time.Second)

	info, err := a.updater.CheckLatest(currentVersion, runtime.GOOS, runtime.GOARCH)
	if err != nil {
		wailsruntime.LogWarningf(a.ctx, "Update check failed: %v", err)
		return
	}
	if !info.HasUpdate {
		return
	}

	choice, err := wailsruntime.MessageDialog(a.ctx, wailsruntime.MessageDialogOptions{
		Type:          wailsruntime.QuestionDialog,
		Title:         "LiteSound Update",
		Message:       fmt.Sprintf("Current version: %s\nLatest version: %s\n\nUpdate now?", info.CurrentVersion, info.LatestVersion),
		Buttons:       []string{"Update Now", "Later"},
		DefaultButton: "Update Now",
		CancelButton:  "Later",
	})
	if err != nil || choice != "Update Now" {
		return
	}

	installerPath, err := a.updater.DownloadInstaller(info)
	if err != nil {
		wailsruntime.LogErrorf(a.ctx, "Update download failed: %v", err)
		_, _ = wailsruntime.MessageDialog(a.ctx, wailsruntime.MessageDialogOptions{
			Type:    wailsruntime.ErrorDialog,
			Title:   "LiteSound Update",
			Message: "Failed to download the update installer.",
		})
		return
	}

	if err := a.updater.LaunchInstaller(installerPath); err != nil {
		wailsruntime.LogErrorf(a.ctx, "Failed to launch installer: %v", err)
		_, _ = wailsruntime.MessageDialog(a.ctx, wailsruntime.MessageDialogOptions{
			Type:    wailsruntime.ErrorDialog,
			Title:   "LiteSound Update",
			Message: "Downloaded update, but failed to start installer.",
		})
		return
	}

	wailsruntime.Quit(a.ctx)
}
