//go:build windows

package app

import (
	"runtime"
	"sync"
	"unsafe"

	wailsruntime "github.com/wailsapp/wails/v2/pkg/runtime"
	"golang.org/x/sys/windows"
)

const (
	hotkeyPlayPause = 1
	hotkeyNext      = 2
	hotkeyPrev      = 3
)

const (
	modAlt     = 0x0001
	modControl = 0x0002
	vkSpace    = 0x20
	vkLeft     = 0x25
	vkRight    = 0x27
	wmHotkey   = 0x0312
	wmQuit     = 0x0012
)

var (
	user32                = windows.NewLazySystemDLL("user32.dll")
	procRegisterHotKey    = user32.NewProc("RegisterHotKey")
	procUnregisterHotKey  = user32.NewProc("UnregisterHotKey")
	procPostThreadMessage = user32.NewProc("PostThreadMessageW")
	procGetMessage        = user32.NewProc("GetMessageW")
)

var (
	hotkeyOnce     sync.Once
	hotkeyThreadID uint32
)

func startHotkeys(a *App) {
	hotkeyOnce.Do(func() {
		go runHotkeys(a)
	})
}

func stopHotkeys() {
	if hotkeyThreadID != 0 {
		_, _, _ = procPostThreadMessage.Call(uintptr(hotkeyThreadID), uintptr(wmQuit), 0, 0)
	}
}

func runHotkeys(a *App) {
	runtime.LockOSThread()
	defer runtime.UnlockOSThread()
	hotkeyThreadID = windows.GetCurrentThreadId()

	if !registerHotkeys() {
		return
	}
	defer unregisterHotkeys()

	var msg struct {
		HWnd    uintptr
		Message uint32
		WParam  uintptr
		LParam  uintptr
		Time    uint32
		Pt      struct {
			X int32
			Y int32
		}
	}
	for {
		ret, _, _ := procGetMessage.Call(uintptr(unsafe.Pointer(&msg)), 0, 0, 0)
		if int32(ret) == 0 || int32(ret) == -1 {
			return
		}
		if msg.Message != wmHotkey {
			continue
		}
		switch msg.WParam {
		case hotkeyPlayPause:
			wailsruntime.EventsEmit(a.ctx, "hotkey:playpause")
		case hotkeyNext:
			wailsruntime.EventsEmit(a.ctx, "hotkey:next")
		case hotkeyPrev:
			wailsruntime.EventsEmit(a.ctx, "hotkey:prev")
		}
	}
}

func registerHotkeys() bool {
	mod := uint(modControl | modAlt)
	if !registerHotKey(hotkeyPlayPause, mod, vkSpace) {
		return false
	}
	if !registerHotKey(hotkeyNext, mod, vkRight) {
		unregisterHotKey(hotkeyPlayPause)
		return false
	}
	if !registerHotKey(hotkeyPrev, mod, vkLeft) {
		unregisterHotKey(hotkeyPlayPause)
		unregisterHotKey(hotkeyNext)
		return false
	}
	return true
}

func unregisterHotkeys() {
	unregisterHotKey(hotkeyPlayPause)
	unregisterHotKey(hotkeyNext)
	unregisterHotKey(hotkeyPrev)
}

func registerHotKey(id int, mod uint, vk uint) bool {
	ret, _, _ := procRegisterHotKey.Call(0, uintptr(id), uintptr(mod), uintptr(vk))
	return ret != 0
}

func unregisterHotKey(id int) {
	_, _, _ = procUnregisterHotKey.Call(0, uintptr(id))
}
