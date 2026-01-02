package main

import (
	"context"
	"fmt"
	"net"
	"net/http"
	"os"
	"path/filepath"
	"strings"
)

type StreamServer struct {
	server   *http.Server
	baseURL  string
	musicDir func() (string, error)
}

func StartStreamServer(musicDir func() (string, error)) (*StreamServer, error) {
	mux := http.NewServeMux()
	s := &StreamServer{musicDir: musicDir}
	mux.HandleFunc("/media", s.handleMedia)

	server := &http.Server{
		Handler: mux,
	}

	listener, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		return nil, err
	}
	s.server = server
	s.baseURL = "http://" + listener.Addr().String()

	go func() {
		_ = server.Serve(listener)
	}()

	return s, nil
}

func (s *StreamServer) BaseURL() string {
	return s.baseURL
}

func (s *StreamServer) Close(ctx context.Context) error {
	return s.server.Shutdown(ctx)
}

func (s *StreamServer) handleMedia(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	if r.Method == http.MethodOptions {
		w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Range, Content-Type")
		w.WriteHeader(http.StatusNoContent)
		return
	}
	if r.Method != http.MethodGet {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	path := r.URL.Query().Get("path")
	if path == "" {
		http.Error(w, "path is required", http.StatusBadRequest)
		return
	}
	ext := strings.ToLower(filepath.Ext(path))
	mime, ok := allowedAudioExt[ext]
	if !ok {
		http.Error(w, "unsupported audio type", http.StatusBadRequest)
		return
	}

	dir, err := s.musicDir()
	if err != nil {
		http.Error(w, "invalid music directory", http.StatusInternalServerError)
		return
	}
	absDir, err := filepath.Abs(dir)
	if err != nil {
		http.Error(w, "invalid music directory", http.StatusInternalServerError)
		return
	}
	absFile, err := filepath.Abs(path)
	if err != nil {
		http.Error(w, "invalid path", http.StatusBadRequest)
		return
	}
	if !isPathWithinDir(absDir, absFile) {
		http.Error(w, "file not in music directory", http.StatusForbidden)
		return
	}

	file, err := os.Open(absFile)
	if err != nil {
		if os.IsNotExist(err) {
			http.Error(w, "file not found", http.StatusNotFound)
			return
		}
		http.Error(w, fmt.Sprintf("failed to open file: %v", err), http.StatusInternalServerError)
		return
	}
	defer file.Close()

	info, err := file.Stat()
	if err != nil {
		http.Error(w, "failed to stat file", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", mime)
	w.Header().Set("Accept-Ranges", "bytes")
	http.ServeContent(w, r, filepath.Base(absFile), info.ModTime(), file)
}
