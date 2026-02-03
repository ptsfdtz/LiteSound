package media

import (
	"os"
	"path/filepath"
	"strings"
)

func IsPathWithinDir(dir string, file string) bool {
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

func IsPathWithinAnyDir(dirs []string, file string) bool {
	for _, dir := range dirs {
		if dir == "" {
			continue
		}
		if IsPathWithinDir(dir, file) {
			return true
		}
	}
	return false
}
