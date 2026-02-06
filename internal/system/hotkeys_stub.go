//go:build !windows

package system

import "context"

func StartHotkeys(ctx context.Context) {}

func StopHotkeys() {}
