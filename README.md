# LiteSound

## Introduction
LiteSound is a lightweight desktop music player built with Wails, Go, React, and TypeScript. It focuses on local music playback, fast startup, and a clean, native-feeling UI without Electron overhead.

## Features
- Local library scan (system Music folder by default, configurable)
- Playlists with favorites
- Playback modes: order, repeat one, shuffle
- System volume control with live sync
- Custom tray menu with playback controls
- Light, dark, and system theme modes
- Single-instance behavior

## Architecture
See `ARCHITECTURE.md` for a detailed breakdown of the backend, frontend, and data flow.

## Installation
### Prebuilt binaries
Download the latest Windows build from the GitHub Releases page.

### Build from source
```bash
# Clone
git clone https://github.com/ptsfdtz/LiteSound.git
cd LiteSound

# Install frontend dependencies
cd frontend
pnpm install
cd ..

# Run in dev mode
wails dev

# Build production
wails build
```

## Usage
- Place audio files in your system Music folder, or set custom folders in Settings.
- Use the tray menu for quick play/pause/skip controls.
- Create playlists and add/remove tracks from them.

## Development
- Requirements: Go, Wails CLI v2, Node.js, pnpm.
- Backend code lives in the repo root (`*.go`).
- Frontend code lives in `frontend/` (React + TypeScript + CSS Modules).
- Generated Wails bindings are in `frontend/wailsjs/`.

Common commands:
```bash
wails dev
wails build
```

## FAQ
**Where does LiteSound look for music?**
By default it scans your system Music directory. You can add or replace folders in Settings.

**Why is there a local HTTP server?**
The backend exposes a local stream server for the webview audio playback.

**How is state persisted?**
User state (last played track, filters, playlists, theme, and music folders) is stored under the user config directory.
