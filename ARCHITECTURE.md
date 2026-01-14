# Architecture

## Overview
LiteSound is a Wails desktop application with a Go backend and a React/TypeScript frontend. The backend manages filesystem access, metadata parsing, state persistence, and a local streaming server. The frontend provides the UI and playback controls using Howler.js.

## Backend (Go)
Key responsibilities:
- Library scanning and metadata (`library.go`, `metadata.go`)
- Playlist management (`playlists.go`)
- Persisted state (`state.go`)
- Local streaming server (`stream.go`)
- Tray menu and hotkeys (`tray.go`, `hotkeys.go`)
- Theme and system volume control (`theme.go`, `volume.go`)

Persisted state is stored in the user config directory under `LiteSound/state.json` and includes:
- Last played track
- Active playlist
- Filters
- Theme
- Music folders
- Playlists

## Frontend (React)
Key areas:
- `frontend/src/components/` UI components
- `frontend/src/hooks/` shared logic (player, playlists, library)
- `frontend/src/locales/` i18n resources
- `frontend/src/services/api.ts` Wails bindings wrapper

Playback uses Howler.js with a local stream URL provided by the backend.

## Data flow
1. Frontend requests music files and playlists via Wails bindings.
2. Backend scans folders and returns metadata.
3. Frontend plays audio using the stream base URL and file path.
4. Playback state and filters are persisted via backend APIs.

## Tray menu
The tray menu is implemented in Go using Win32 APIs. Actions dispatch events back into the app runtime (play/pause/next/prev and play mode changes).

## Single instance
Single instance is enforced via Wails `SingleInstanceLock`. The second launch brings the existing window to the foreground.
