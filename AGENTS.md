# LiteSound Agent Guide

## Project overview
- Wails desktop app with Go backend and React/TypeScript frontend.
- Backend handles library scanning, metadata, playlists, state persistence, stream server, tray, hotkeys, theme, and volume.
- Frontend uses Howler.js and talks to Wails bindings via `frontend/src/services/api.ts`.

## Key locations
- Frontend entry: `frontend/src/App.tsx`
- UI components: `frontend/src/components/`
- Hooks: `frontend/src/hooks/`
- i18n: `frontend/src/locales/`
- Wails bindings (generated): `frontend/wailsjs/go/main/App.d.ts`
- Backend modules: `internal/app/library.go`, `internal/app/metadata.go`, `internal/app/playlists.go`, `internal/app/state.go`, `internal/app/stream.go`, `internal/app/tray.go`, `internal/app/hotkeys.go`, `internal/app/theme.go`, `internal/app/volume.go`

## Local data
- Persisted state lives under the user config directory at `LiteSound/state.json`.

## Development prerequisites (from CONTRIBUTING)
- Windows only.
- Node.js LTS (>=18) and `pnpm`.
- Go (>=1.21) and Wails CLI (`go install github.com/wailsapp/wails/v2/cmd/wails@latest`).

## Common commands
- Install deps (repo root): `pnpm install`
- Dev (frontend + backend): `wails dev`
- Build: `wails build`
- Frontend format: `pnpm format`
- Go format: `gofmt -w .`

## API surface (backend -> frontend)
- Library: `ListMusicFiles`, `ReadMusicFile`, `GetStreamBaseURL`
- Music dirs: `GetMusicDir(s)`, `SetMusicDir(s)`, `PickMusicDir`
- Playback state: `Get/SetLastPlayed`, `Get/SetActivePlaylist`, `Get/SetFilters`
- Playlists: `GetPlaylists`, `CreatePlaylist`, `DeletePlaylist`, `AddToPlaylist`, `RemoveFromPlaylist`
- Theme/volume: `Get/SetTheme`, `Get/SetSystemVolume`
- Tray: `UpdateTrayPlayback`

## Notes for changes
- UI work should live under `frontend/src/components` and be wired from `frontend/src/App.tsx`.
- Use Prettier for frontend formatting and `gofmt` for Go.
- Avoid editing generated Wails bindings unless regenerating.
