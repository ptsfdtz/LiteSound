package main

import (
	"context"
	"embed"

	"LiteSound/internal/app"
	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
)

//go:embed all:frontend/dist
var assets embed.FS

// Set via ldflags in release builds, e.g. -X main.appVersion=v0.2.1
var appVersion = "dev"

// Set via ldflags if publishing from a fork.
var updateRepoOwner = "ptsfdtz"
var updateRepoName = "LiteSound"

func main() {
	// Create an instance of the app structure
	appInstance := app.NewApp(appVersion, updateRepoOwner, updateRepoName)

	// Create application with options
	err := wails.Run(&options.App{
		Title:             "LiteSound",
		Width:             1024,
		Height:            768,
		Frameless:         true,
		HideWindowOnClose: true,
		MinWidth:          904,
		MinHeight:         500,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 160},
		OnStartup: func(ctx context.Context) {
			app.Startup(appInstance, ctx)
		},
		OnShutdown: func(ctx context.Context) {
			app.Shutdown(appInstance, ctx)
		},
		SingleInstanceLock: &options.SingleInstanceLock{
			UniqueId: "litesound",
			OnSecondInstanceLaunch: func(_ options.SecondInstanceData) {
				app.BringToFront(appInstance)
			},
		},
		Bind: []interface{}{
			appInstance,
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}
