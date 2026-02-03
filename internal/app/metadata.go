package app

import (
	"os"
	"strings"

	"github.com/dhowden/tag"
)

func readAudioMetadata(path string) (string, string) {
	file, err := os.Open(path)
	if err != nil {
		return "", ""
	}
	defer file.Close()

	metadata, err := tag.ReadFrom(file)
	if err != nil {
		return "", ""
	}

	album := strings.TrimSpace(metadata.Album())
	composer := strings.TrimSpace(metadata.Composer())
	if composer == "" {
		composer = strings.TrimSpace(metadata.Artist())
	}

	return composer, album
}
