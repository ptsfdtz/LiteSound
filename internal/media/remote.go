package media

import (
	"fmt"
	"path"
	"strconv"
	"strings"
)

const (
	NeteaseCloudPathPrefix   = "neteasecloud:"
	DefaultNeteaseAPIBaseURL = "http://127.0.0.1:3000"
)

func BuildNeteaseCloudPath(songID int64, ext string) string {
	trimmedExt := strings.ToLower(strings.TrimSpace(ext))
	if trimmedExt == "" {
		trimmedExt = ".mp3"
	}
	if !strings.HasPrefix(trimmedExt, ".") {
		trimmedExt = "." + trimmedExt
	}
	return fmt.Sprintf("%s%d%s", NeteaseCloudPathPrefix, songID, trimmedExt)
}

func ParseNeteaseCloudPath(trackPath string) (songID int64, ext string, ok bool) {
	raw := strings.TrimSpace(trackPath)
	if raw == "" {
		return 0, "", false
	}
	if !strings.HasPrefix(strings.ToLower(raw), NeteaseCloudPathPrefix) {
		return 0, "", false
	}
	value := raw[len(NeteaseCloudPathPrefix):]
	if value == "" {
		return 0, "", false
	}
	ext = strings.ToLower(path.Ext(value))
	idPart := strings.TrimSuffix(value, ext)
	idPart = strings.TrimSpace(idPart)
	if idPart == "" {
		return 0, "", false
	}
	parsedID, err := strconv.ParseInt(idPart, 10, 64)
	if err != nil || parsedID <= 0 {
		return 0, "", false
	}
	if ext == "" {
		ext = ".mp3"
	}
	return parsedID, ext, true
}
