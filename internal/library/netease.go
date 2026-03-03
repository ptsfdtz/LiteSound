package library

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"LiteSound/internal/media"
	"LiteSound/internal/state"
)

const (
	neteaseCloudPageLimit = 200
	neteaseMaxCloudPages  = 30
)

type NeteaseClient struct {
	store      *state.Store
	httpClient *http.Client
}

func NewNeteaseClient(store *state.Store) *NeteaseClient {
	return &NeteaseClient{
		store: store,
		httpClient: &http.Client{
			Timeout: 15 * time.Second,
		},
	}
}

func (c *NeteaseClient) ListCloudMusicFiles() ([]media.MusicFile, error) {
	if c == nil || c.store == nil {
		return nil, nil
	}
	config, err := c.store.GetNeteaseConfig()
	if err != nil {
		return nil, err
	}
	if !config.Enabled {
		return nil, nil
	}

	entries := make([]media.MusicFile, 0)
	seen := make(map[int64]struct{})
	offset := 0

	for page := 0; page < neteaseMaxCloudPages; page++ {
		query := url.Values{}
		query.Set("limit", strconv.Itoa(neteaseCloudPageLimit))
		query.Set("offset", strconv.Itoa(offset))

		resp, err := c.getJSON(config, "/user/cloud", query)
		if err != nil {
			return nil, err
		}
		if err := ensureNeteaseSuccess(resp); err != nil {
			return nil, err
		}

		items := asSlice(resp["data"])
		for _, rawItem := range items {
			item := asMap(rawItem)
			if len(item) == 0 {
				continue
			}
			file, ok := parseCloudTrack(item)
			if !ok {
				continue
			}
			songID, _, isCloud := media.ParseNeteaseCloudPath(file.Path)
			if !isCloud {
				continue
			}
			if _, exists := seen[songID]; exists {
				continue
			}
			seen[songID] = struct{}{}
			entries = append(entries, file)
		}

		if len(items) == 0 || !asBool(resp["hasMore"]) {
			break
		}
		offset += len(items)
	}

	return entries, nil
}

func (c *NeteaseClient) ResolveSongURL(songID int64) (string, error) {
	if c == nil || c.store == nil {
		return "", errors.New("netease client unavailable")
	}
	if songID <= 0 {
		return "", errors.New("invalid song id")
	}

	config, err := c.store.GetNeteaseConfig()
	if err != nil {
		return "", err
	}
	if !config.Enabled {
		return "", errors.New("netease cloud is disabled")
	}

	query := url.Values{}
	query.Set("id", strconv.FormatInt(songID, 10))
	query.Set("level", config.Quality)
	primaryResp, err := c.getJSON(config, "/song/url/v1", query)
	primaryErr := err
	if primaryErr == nil {
		primaryErr = ensureNeteaseSuccess(primaryResp)
	}
	if primaryErr == nil {
		if playURL := pickSongURL(primaryResp, songID); playURL != "" {
			return playURL, nil
		}
	}

	fallbackQuery := url.Values{}
	fallbackQuery.Set("id", strconv.FormatInt(songID, 10))
	fallbackQuery.Set("br", "320000")
	fallbackResp, err := c.getJSON(config, "/song/url", fallbackQuery)
	if err != nil {
		if primaryErr != nil {
			return "", primaryErr
		}
		return "", err
	}
	if err := ensureNeteaseSuccess(fallbackResp); err != nil {
		return "", err
	}

	playURL := pickSongURL(fallbackResp, songID)
	if playURL == "" {
		if primaryErr != nil {
			return "", primaryErr
		}
		return "", errors.New("netease did not return a playable url")
	}
	return playURL, nil
}

func (c *NeteaseClient) getJSON(config state.NeteaseConfig, endpoint string, query url.Values) (map[string]any, error) {
	if query == nil {
		query = url.Values{}
	}
	if config.Cookie != "" {
		query.Set("cookie", config.Cookie)
	}

	baseURL := strings.TrimRight(strings.TrimSpace(config.APIBaseURL), "/")
	requestURL := baseURL + endpoint
	if encodedQuery := query.Encode(); encodedQuery != "" {
		requestURL += "?" + encodedQuery
	}

	req, err := http.NewRequest(http.MethodGet, requestURL, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Accept", "application/json")
	if config.Cookie != "" {
		req.Header.Set("Cookie", config.Cookie)
	}

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return nil, fmt.Errorf("netease api status %d: %s", resp.StatusCode, strings.TrimSpace(string(body)))
	}

	parsed := map[string]any{}
	if err := json.Unmarshal(body, &parsed); err != nil {
		return nil, fmt.Errorf("invalid netease response: %w", err)
	}
	return parsed, nil
}

func parseCloudTrack(item map[string]any) (media.MusicFile, bool) {
	simpleSong := asMap(item["simpleSong"])
	songID := asInt64(item["songId"])
	if songID == 0 {
		songID = asInt64(item["songid"])
	}
	if songID == 0 {
		songID = asInt64(item["id"])
	}
	if songID == 0 {
		songID = asInt64(simpleSong["id"])
	}
	if songID <= 0 {
		return media.MusicFile{}, false
	}

	fileName := asString(item["fileName"])
	name := strings.TrimSpace(asString(item["songName"]))
	if name == "" {
		name = strings.TrimSpace(asString(simpleSong["name"]))
	}
	if name == "" && fileName != "" {
		name = strings.TrimSuffix(fileName, filepath.Ext(fileName))
	}
	if name == "" {
		name = fmt.Sprintf("Cloud Track %d", songID)
	}

	ext := strings.ToLower(filepath.Ext(fileName))
	if _, ok := media.AllowedAudioExt[ext]; !ok {
		ext = ".mp3"
	}

	composer := strings.TrimSpace(asString(item["artist"]))
	if composer == "" {
		composer = strings.TrimSpace(asString(item["artistName"]))
	}
	if composer == "" {
		composer = extractArtists(simpleSong)
	}
	if composer == "" {
		composer = "Unknown"
	}

	album := strings.TrimSpace(asString(item["album"]))
	if album == "" {
		album = strings.TrimSpace(asString(item["albumName"]))
	}
	if album == "" {
		album = strings.TrimSpace(asString(asMap(simpleSong["al"])["name"]))
	}
	if album == "" {
		album = "Unknown"
	}

	return media.MusicFile{
		Name:     name + ext,
		Path:     media.BuildNeteaseCloudPath(songID, ext),
		Ext:      ext,
		Composer: composer,
		Album:    album,
	}, true
}

func extractArtists(simpleSong map[string]any) string {
	if len(simpleSong) == 0 {
		return ""
	}
	artists := asSlice(simpleSong["ar"])
	if len(artists) == 0 {
		return ""
	}
	names := make([]string, 0, len(artists))
	for _, rawArtist := range artists {
		name := strings.TrimSpace(asString(asMap(rawArtist)["name"]))
		if name == "" {
			continue
		}
		names = append(names, name)
	}
	return strings.Join(names, ", ")
}

func pickSongURL(resp map[string]any, songID int64) string {
	items := asSlice(resp["data"])
	if len(items) == 0 {
		return ""
	}
	var fallback string
	for _, rawItem := range items {
		item := asMap(rawItem)
		if len(item) == 0 {
			continue
		}
		urlValue := strings.TrimSpace(asString(item["url"]))
		if urlValue == "" {
			continue
		}
		itemID := asInt64(item["id"])
		if itemID == songID {
			return urlValue
		}
		if fallback == "" {
			fallback = urlValue
		}
	}
	return fallback
}

func ensureNeteaseSuccess(resp map[string]any) error {
	if len(resp) == 0 {
		return errors.New("empty netease response")
	}
	code := asInt64(resp["code"])
	if code == 0 || code == 200 {
		return nil
	}
	message := strings.TrimSpace(asString(resp["message"]))
	if message == "" {
		message = strings.TrimSpace(asString(resp["msg"]))
	}
	if message == "" {
		message = "netease api request failed"
	}
	return fmt.Errorf("%s (code: %d)", message, code)
}

func asMap(value any) map[string]any {
	if value == nil {
		return map[string]any{}
	}
	typed, ok := value.(map[string]any)
	if !ok {
		return map[string]any{}
	}
	return typed
}

func asSlice(value any) []any {
	typed, ok := value.([]any)
	if !ok {
		return []any{}
	}
	return typed
}

func asString(value any) string {
	switch typed := value.(type) {
	case string:
		return typed
	case json.Number:
		return typed.String()
	case float64:
		return strconv.FormatFloat(typed, 'f', -1, 64)
	case int:
		return strconv.Itoa(typed)
	case int64:
		return strconv.FormatInt(typed, 10)
	default:
		return ""
	}
}

func asInt64(value any) int64 {
	switch typed := value.(type) {
	case int:
		return int64(typed)
	case int32:
		return int64(typed)
	case int64:
		return typed
	case float64:
		return int64(typed)
	case json.Number:
		parsed, err := typed.Int64()
		if err == nil {
			return parsed
		}
		fallback, err := strconv.ParseFloat(typed.String(), 64)
		if err != nil {
			return 0
		}
		return int64(fallback)
	case string:
		parsed, err := strconv.ParseInt(strings.TrimSpace(typed), 10, 64)
		if err != nil {
			return 0
		}
		return parsed
	default:
		return 0
	}
}

func asBool(value any) bool {
	switch typed := value.(type) {
	case bool:
		return typed
	case string:
		return strings.EqualFold(strings.TrimSpace(typed), "true")
	case float64:
		return typed != 0
	case int:
		return typed != 0
	case int64:
		return typed != 0
	default:
		return false
	}
}
