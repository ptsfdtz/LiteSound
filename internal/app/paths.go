package app

import (
	"os"
	"path/filepath"
	"strings"
)

func isPathWithinDir(dir string, file string) bool {
	dir = strings.ToLower(filepath.Clean(dir))
	file = strings.ToLower(filepath.Clean(file))
	if dir == file {
		return true
	}
	if !strings.HasSuffix(dir, string(os.PathSeparator)) {
		dir += string(os.PathSeparator)
	}
	return strings.HasPrefix(file, dir)
}

func isPathWithinAnyDir(dirs []string, file string) bool {
	for _, dir := range dirs {
		if dir == "" {
			continue
		}
		if isPathWithinDir(dir, file) {
			return true
		}
	}
	return false
}
