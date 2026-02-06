package media

import (
	"os"
	"path/filepath"
	"strings"
)

func IsPathWithinDir(dir string, file string) bool {
	resolvedDir, err := ResolveExistingPath(dir)
	if err != nil {
		return false
	}
	resolvedFile, err := ResolveExistingPath(file)
	if err != nil {
		return false
	}
	relative, err := filepath.Rel(resolvedDir, resolvedFile)
	if err != nil {
		return false
	}
	if relative == "." {
		return true
	}
	if relative == ".." {
		return false
	}
	if strings.HasPrefix(relative, ".."+string(os.PathSeparator)) {
		return false
	}
	return true
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

func ResolveExistingPath(path string) (string, error) {
	absPath, err := filepath.Abs(path)
	if err != nil {
		return "", err
	}
	resolvedPath, err := filepath.EvalSymlinks(absPath)
	if err != nil {
		return "", err
	}
	return filepath.Clean(resolvedPath), nil
}
