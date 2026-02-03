package system

import (
	"context"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

func ApplyTheme(ctx context.Context, theme string) {
	if ctx == nil {
		return
	}
	switch theme {
	case "light":
		runtime.WindowSetLightTheme(ctx)
	case "dark":
		runtime.WindowSetDarkTheme(ctx)
	default:
		runtime.WindowSetSystemDefaultTheme(ctx)
	}
}
