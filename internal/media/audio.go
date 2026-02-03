package media

import (
	"os"
	"path/filepath"
	"strings"
)

var AllowedAudioExt = map[string]string{
	".mp3":  "audio/mpeg",
	".flac": "audio/flac",
	".wav":  "audio/wav",
	".ogg":  "audio/ogg",
	".m4a":  "audio/mp4",
	".aac":  "audio/aac",
}

type MusicFile struct {
	Name     string `json:"name"`
	Path     string `json:"path"`
	Ext      string `json:"ext"`
	Composer string `json:"composer"`
	Album    string `json:"album"`
}

func DefaultMusicDir() (string, error) {
	home, err := os.UserHomeDir()
	if err != nil {
		return "", err
	}
	return filepath.Join(home, "Music"), nil
}

func IsAllowedAudio(path string) bool {
	ext := strings.ToLower(filepath.Ext(path))
	_, ok := AllowedAudioExt[ext]
	return ok
}
