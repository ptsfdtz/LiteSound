# LiteSound

LiteSound is a desktop music player built with Wails.

## Features

- Local music library scanning
- Composer/album filtering
- Playlists
- System volume control

## Usage

1. Download or copy your music files to the system Music folder.
2. Launch LiteSound. It will scan the Music folder automatically.

Default Music folder paths:

- Windows: `C:\Users\<YourName>\Music`
- macOS: `~/Music`

## Supported formats

`mp3`, `flac`, `wav`, `ogg`, `m4a`, `aac`

## Development

```bash
pnpm install
pnpm run build
```

```bash
wails dev
```

## Release

Tag a version to trigger GitHub Actions release builds:

```bash
git tag -a v0.0.1 -m "v0.0.1"
git push origin v0.0.1
```
