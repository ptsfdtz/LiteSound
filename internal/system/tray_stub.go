//go:build !windows

package system

import "context"

type Tray struct{}

func NewTray() *Tray {
	return &Tray{}
}

func (t *Tray) Start(ctx context.Context) {}

func (t *Tray) UpdatePlayback(track string, isPlaying bool, playMode string) {}
