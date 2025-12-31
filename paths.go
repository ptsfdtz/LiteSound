package main

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
