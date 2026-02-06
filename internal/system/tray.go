//go:build windows

package system

import (
	"context"
	"embed"
	"os"
	"path/filepath"
	"runtime"
	"sync"
	"syscall"
	"unsafe"

	"github.com/lxn/win"
	wailsruntime "github.com/wailsapp/wails/v2/pkg/runtime"
)

const (
	trayMsgID       = win.WM_APP + 1
	trayUpdateMsg   = win.WM_APP + 2
	trayMenuTrack   = 1001
	trayMenuPrev    = 1002
	trayMenuPlay    = 1003
	trayMenuNext    = 1004
	trayMenuMode    = 1005
	trayMenuShow    = 1006
	trayMenuHide    = 1007
	trayMenuQuit    = 1008
	trayModeOrder   = 1101
	trayModeRepeat  = 1102
	trayModeShuffle = 1103
)

type trayState struct {
	track     string
	isPlaying bool
	playMode  string
}

type Tray struct {
	mu sync.Mutex

	ctx   context.Context
	ready bool
	state trayState

	hwnd     win.HWND
	menu     win.HMENU
	modeMenu win.HMENU

	icon win.HICON
}

var trayOnce sync.Once
var (
	user32DLL       = syscall.NewLazyDLL("user32.dll")
	procAppendMenuW = user32DLL.NewProc("AppendMenuW")
	procModifyMenuW = user32DLL.NewProc("ModifyMenuW")
	procCheckMenu   = user32DLL.NewProc("CheckMenuItem")
)

//go:embed assets/icon.ico
var trayAssets embed.FS

func NewTray() *Tray {
	return &Tray{state: trayState{}}
}

func (t *Tray) Start(ctx context.Context) {
	if t == nil {
		return
	}
	trayOnce.Do(func() {
		t.ctx = ctx
		go t.run()
	})
}

func (t *Tray) UpdatePlayback(track string, isPlaying bool, playMode string) {
	if t == nil {
		return
	}
	t.setState(track, isPlaying, playMode)
}

func (t *Tray) setState(track string, isPlaying bool, playMode string) {
	t.mu.Lock()
	t.state = trayState{
		track:     track,
		isPlaying: isPlaying,
		playMode:  playMode,
	}
	if t.ready && t.hwnd != 0 {
		win.PostMessage(t.hwnd, trayUpdateMsg, 0, 0)
	}
	t.mu.Unlock()
}

func (t *Tray) run() {
	runtime.LockOSThread()
	defer runtime.UnlockOSThread()

	className := syscall.StringToUTF16Ptr("LiteSoundTrayWindow")
	instance := win.GetModuleHandle(nil)
	wndClass := win.WNDCLASSEX{
		CbSize:        uint32(unsafe.Sizeof(win.WNDCLASSEX{})),
		HInstance:     instance,
		LpszClassName: className,
		LpfnWndProc: syscall.NewCallback(func(hwnd win.HWND, msg uint32, wParam, lParam uintptr) uintptr {
			switch msg {
			case trayMsgID:
				return t.handleTrayMessage(hwnd, lParam)
			case win.WM_COMMAND:
				return t.handleCommand(hwnd, wParam)
			case trayUpdateMsg:
				t.applyState()
				return 0
			}
			return win.DefWindowProc(hwnd, msg, wParam, lParam)
		}),
	}
	win.RegisterClassEx(&wndClass)

	hwnd := win.CreateWindowEx(
		0,
		className,
		syscall.StringToUTF16Ptr("LiteSoundTray"),
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		instance,
		nil,
	)
	if hwnd == 0 {
		return
	}

	t.hwnd = hwnd
	t.menu = win.CreatePopupMenu()
	t.modeMenu = win.CreatePopupMenu()

	appendMenu(t.menu, win.MF_STRING|win.MF_GRAYED, trayMenuTrack, "No track")
	appendMenu(t.menu, win.MF_SEPARATOR, 0, "")
	appendMenu(t.menu, win.MF_STRING, trayMenuPrev, "Previous")
	appendMenu(t.menu, win.MF_STRING, trayMenuPlay, "Play")
	appendMenu(t.menu, win.MF_STRING, trayMenuNext, "Next")
	appendMenu(t.menu, win.MF_SEPARATOR, 0, "")
	appendMenu(t.menu, win.MF_POPUP, uintptr(t.modeMenu), "Play mode")
	appendMenu(t.modeMenu, win.MF_STRING, trayModeOrder, "Order")
	appendMenu(t.modeMenu, win.MF_STRING, trayModeRepeat, "Repeat one")
	appendMenu(t.modeMenu, win.MF_STRING, trayModeShuffle, "Shuffle")
	appendMenu(t.menu, win.MF_SEPARATOR, 0, "")
	appendMenu(t.menu, win.MF_STRING, trayMenuShow, "Show")
	appendMenu(t.menu, win.MF_STRING, trayMenuHide, "Hide")
	appendMenu(t.menu, win.MF_STRING, trayMenuQuit, "Quit")

	t.loadIcon()
	t.addTrayIcon()

	t.mu.Lock()
	t.ready = true
	t.mu.Unlock()
	t.applyState()

	var msg win.MSG
	for win.GetMessage(&msg, 0, 0, 0) != 0 {
		win.TranslateMessage(&msg)
		win.DispatchMessage(&msg)
	}
}

func (t *Tray) handleTrayMessage(hwnd win.HWND, lParam uintptr) uintptr {
	if t.ctx == nil {
		return 0
	}
	switch lParam {
	case win.WM_LBUTTONUP:
		wailsruntime.Show(t.ctx)
		wailsruntime.WindowUnminimise(t.ctx)
	case win.WM_RBUTTONUP:
		t.showMenuAndHandle(hwnd)
	}
	return 0
}

func (t *Tray) handleCommand(hwnd win.HWND, wParam uintptr) uintptr {
	if t.ctx == nil {
		return 0
	}
	keepOpen := false
	switch win.LOWORD(uint32(wParam)) {
	case trayMenuPrev:
		wailsruntime.EventsEmit(t.ctx, "hotkey:prev")
		keepOpen = true
	case trayMenuPlay:
		wailsruntime.EventsEmit(t.ctx, "hotkey:playpause")
		keepOpen = true
	case trayMenuNext:
		wailsruntime.EventsEmit(t.ctx, "hotkey:next")
		keepOpen = true
	case trayMenuShow:
		wailsruntime.Show(t.ctx)
		wailsruntime.WindowUnminimise(t.ctx)
	case trayMenuHide:
		wailsruntime.Hide(t.ctx)
	case trayMenuQuit:
		wailsruntime.Quit(t.ctx)
	case trayModeOrder:
		wailsruntime.EventsEmit(t.ctx, "tray:playmode", "order")
		keepOpen = true
	case trayModeRepeat:
		wailsruntime.EventsEmit(t.ctx, "tray:playmode", "repeat")
		keepOpen = true
	case trayModeShuffle:
		wailsruntime.EventsEmit(t.ctx, "tray:playmode", "shuffle")
		keepOpen = true
	}
	if keepOpen {
		go t.showMenuAndHandle(hwnd)
	}
	return 0
}

func (t *Tray) applyState() {
	t.mu.Lock()
	state := t.state
	t.mu.Unlock()

	title := state.track
	if title == "" {
		title = "No track"
	}
	title = truncateTitle(title, 20)
	modifyMenu(t.menu, trayMenuTrack, win.MF_BYCOMMAND|win.MF_STRING|win.MF_GRAYED, uintptr(trayMenuTrack), title)

	playTitle := "Play"
	if state.isPlaying {
		playTitle = "Pause"
	}
	modifyMenu(t.menu, trayMenuPlay, win.MF_BYCOMMAND|win.MF_STRING, uintptr(trayMenuPlay), playTitle)

	hasTrack := state.track != ""
	enable := uint32(win.MF_ENABLED)
	disable := uint32(win.MF_GRAYED)
	if !hasTrack {
		win.EnableMenuItem(t.menu, trayMenuPrev, uint32(win.MF_BYCOMMAND)|disable)
		win.EnableMenuItem(t.menu, trayMenuPlay, uint32(win.MF_BYCOMMAND)|disable)
		win.EnableMenuItem(t.menu, trayMenuNext, uint32(win.MF_BYCOMMAND)|disable)
	} else {
		win.EnableMenuItem(t.menu, trayMenuPrev, uint32(win.MF_BYCOMMAND)|enable)
		win.EnableMenuItem(t.menu, trayMenuPlay, uint32(win.MF_BYCOMMAND)|enable)
		win.EnableMenuItem(t.menu, trayMenuNext, uint32(win.MF_BYCOMMAND)|enable)
	}

	modeTitle := "Play mode: Order"
	switch state.playMode {
	case "repeat":
		modeTitle = "Play mode: Repeat one"
	case "shuffle":
		modeTitle = "Play mode: Shuffle"
	}
	modifyMenu(t.menu, trayMenuMode, win.MF_BYCOMMAND|win.MF_STRING|win.MF_POPUP, uintptr(t.modeMenu), modeTitle)

	checkMenuItem(t.modeMenu, trayModeOrder, win.MF_BYCOMMAND|win.MF_UNCHECKED)
	checkMenuItem(t.modeMenu, trayModeRepeat, win.MF_BYCOMMAND|win.MF_UNCHECKED)
	checkMenuItem(t.modeMenu, trayModeShuffle, win.MF_BYCOMMAND|win.MF_UNCHECKED)
	switch state.playMode {
	case "repeat":
		checkMenuItem(t.modeMenu, trayModeRepeat, win.MF_BYCOMMAND|win.MF_CHECKED)
	case "shuffle":
		checkMenuItem(t.modeMenu, trayModeShuffle, win.MF_BYCOMMAND|win.MF_CHECKED)
	default:
		checkMenuItem(t.modeMenu, trayModeOrder, win.MF_BYCOMMAND|win.MF_CHECKED)
	}
}

func truncateTitle(value string, limit int) string {
	if limit <= 0 || value == "" {
		return value
	}
	runes := []rune(value)
	if len(runes) <= limit {
		return value
	}
	return string(runes[:limit]) + "..."
}

func (t *Tray) showMenuAndHandle(hwnd win.HWND) {
	if cmd := t.showMenu(hwnd); cmd != 0 {
		t.handleCommand(hwnd, uintptr(cmd))
	}
}

func (t *Tray) showMenu(hwnd win.HWND) uint32 {
	var point win.POINT
	win.GetCursorPos(&point)
	win.SetForegroundWindow(hwnd)
	cmd := win.TrackPopupMenu(t.menu, win.TPM_RETURNCMD|win.TPM_RIGHTBUTTON|win.TPM_BOTTOMALIGN|win.TPM_LEFTALIGN, point.X, point.Y, 0, hwnd, nil)
	win.PostMessage(hwnd, win.WM_NULL, 0, 0)
	return cmd
}

func (t *Tray) loadIcon() {
	absPath, err := t.writeEmbeddedIcon()
	if err != nil {
		return
	}
	t.icon = win.HICON(win.LoadImage(0, syscall.StringToUTF16Ptr(absPath), win.IMAGE_ICON, 0, 0, win.LR_LOADFROMFILE))
}

func (t *Tray) addTrayIcon() {
	if t.hwnd == 0 || t.icon == 0 {
		return
	}
	var nid win.NOTIFYICONDATA
	nid.CbSize = uint32(unsafe.Sizeof(nid))
	nid.HWnd = t.hwnd
	nid.UID = 1
	nid.UFlags = win.NIF_MESSAGE | win.NIF_ICON | win.NIF_TIP
	nid.UCallbackMessage = trayMsgID
	nid.HIcon = t.icon
	copy(nid.SzTip[:], syscall.StringToUTF16("LiteSound"))
	win.Shell_NotifyIcon(win.NIM_ADD, &nid)
}

func (t *Tray) writeEmbeddedIcon() (string, error) {
	data, err := trayAssets.ReadFile("assets/icon.ico")
	if err != nil {
		return "", err
	}
	path := filepath.Join(os.TempDir(), "litesound-tray.ico")
	if info, err := os.Stat(path); err == nil && info.Size() == int64(len(data)) {
		return path, nil
	}
	if err := os.WriteFile(path, data, 0o644); err != nil {
		return "", err
	}
	return path, nil
}

func appendMenu(menu win.HMENU, flags uint32, item uintptr, title string) bool {
	var titlePtr uintptr
	if title != "" {
		titlePtr = uintptr(unsafe.Pointer(syscall.StringToUTF16Ptr(title)))
	}
	ret, _, _ := procAppendMenuW.Call(uintptr(menu), uintptr(flags), item, titlePtr)
	return ret != 0
}

func modifyMenu(menu win.HMENU, item uint32, flags uint32, newItem uintptr, title string) bool {
	var titlePtr uintptr
	if title != "" {
		titlePtr = uintptr(unsafe.Pointer(syscall.StringToUTF16Ptr(title)))
	}
	ret, _, _ := procModifyMenuW.Call(
		uintptr(menu),
		uintptr(item),
		uintptr(flags),
		newItem,
		titlePtr,
	)
	return ret != 0
}

func checkMenuItem(menu win.HMENU, item uint32, flags uint32) uint32 {
	ret, _, _ := procCheckMenu.Call(uintptr(menu), uintptr(item), uintptr(flags))
	return uint32(ret)
}
