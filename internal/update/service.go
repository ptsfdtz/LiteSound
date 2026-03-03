package update

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"strings"
	"time"
)

const githubAPIBaseURL = "https://api.github.com"

type Service struct {
	owner  string
	repo   string
	client *http.Client
}

type ReleaseInfo struct {
	CurrentVersion string
	LatestVersion  string
	HasUpdate      bool
	AssetName      string
	AssetURL       string
	AssetDigest    string
	ReleasePageURL string
}

type githubRelease struct {
	TagName    string             `json:"tag_name"`
	HTMLURL    string             `json:"html_url"`
	Draft      bool               `json:"draft"`
	Prerelease bool               `json:"prerelease"`
	Assets     []githubAssetBrief `json:"assets"`
}

type githubAssetBrief struct {
	Name               string `json:"name"`
	BrowserDownloadURL string `json:"browser_download_url"`
	Digest             string `json:"digest"`
}

func New(owner string, repo string) *Service {
	trimmedOwner := strings.TrimSpace(owner)
	trimmedRepo := strings.TrimSpace(repo)
	if trimmedOwner == "" {
		trimmedOwner = "ptsfdtz"
	}
	if trimmedRepo == "" {
		trimmedRepo = "LiteSound"
	}
	return &Service{
		owner: trimmedOwner,
		repo:  trimmedRepo,
		client: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

func (s *Service) CheckLatest(currentVersion string, goos string, goarch string) (ReleaseInfo, error) {
	info := ReleaseInfo{
		CurrentVersion: strings.TrimSpace(currentVersion),
	}
	if s == nil {
		return info, errors.New("update service unavailable")
	}
	if strings.TrimSpace(goos) != "windows" {
		return info, nil
	}

	release, err := s.fetchLatestRelease()
	if err != nil {
		return info, err
	}
	if release.Draft || release.Prerelease || !isStableTag(release.TagName) {
		return info, nil
	}
	info.LatestVersion = strings.TrimSpace(release.TagName)
	info.ReleasePageURL = strings.TrimSpace(release.HTMLURL)
	info.HasUpdate = isNewerVersion(info.CurrentVersion, info.LatestVersion)
	if !info.HasUpdate {
		return info, nil
	}

	asset, ok := pickInstallerAsset(release.Assets, goos, goarch)
	if !ok {
		return info, errors.New("latest release does not provide a compatible installer")
	}
	info.AssetName = asset.Name
	info.AssetURL = asset.BrowserDownloadURL
	info.AssetDigest = asset.Digest
	return info, nil
}

func (s *Service) DownloadInstaller(info ReleaseInfo) (string, error) {
	if strings.TrimSpace(info.AssetURL) == "" {
		return "", errors.New("asset url is required")
	}
	assetName := strings.TrimSpace(info.AssetName)
	if assetName == "" {
		assetName = "LiteSound-installer.exe"
	}

	req, err := http.NewRequest(http.MethodGet, info.AssetURL, nil)
	if err != nil {
		return "", err
	}
	req.Header.Set("Accept", "application/octet-stream")
	req.Header.Set("User-Agent", "LiteSound-Updater")

	resp, err := s.client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		body, _ := io.ReadAll(io.LimitReader(resp.Body, 4*1024))
		return "", fmt.Errorf("download installer failed: status %d: %s", resp.StatusCode, strings.TrimSpace(string(body)))
	}

	updateDir := filepath.Join(os.TempDir(), "LiteSound", "updates")
	if err := os.MkdirAll(updateDir, 0o755); err != nil {
		return "", err
	}

	targetPath := filepath.Join(updateDir, assetName)
	tempFile, err := os.CreateTemp(updateDir, "download-*.tmp")
	if err != nil {
		return "", err
	}
	defer func() {
		_ = os.Remove(tempFile.Name())
	}()

	hasher := sha256.New()
	if _, err := io.Copy(io.MultiWriter(tempFile, hasher), resp.Body); err != nil {
		_ = tempFile.Close()
		return "", err
	}
	if err := tempFile.Close(); err != nil {
		return "", err
	}

	expectedHash := parseSHA256Digest(info.AssetDigest)
	if expectedHash != "" {
		actualHash := hex.EncodeToString(hasher.Sum(nil))
		if !strings.EqualFold(actualHash, expectedHash) {
			return "", errors.New("downloaded installer digest verification failed")
		}
	}

	if err := os.Remove(targetPath); err != nil && !os.IsNotExist(err) {
		return "", err
	}
	if err := os.Rename(tempFile.Name(), targetPath); err != nil {
		return "", err
	}
	return targetPath, nil
}

func (s *Service) LaunchInstaller(path string) error {
	trimmedPath := strings.TrimSpace(path)
	if trimmedPath == "" {
		return errors.New("installer path is required")
	}
	if _, err := os.Stat(trimmedPath); err != nil {
		return err
	}
	cmd := exec.Command(trimmedPath)
	return cmd.Start()
}

func (s *Service) fetchLatestRelease() (githubRelease, error) {
	endpoint := fmt.Sprintf("%s/repos/%s/%s/releases/latest", githubAPIBaseURL, s.owner, s.repo)
	req, err := http.NewRequest(http.MethodGet, endpoint, nil)
	if err != nil {
		return githubRelease{}, err
	}
	req.Header.Set("Accept", "application/vnd.github+json")
	req.Header.Set("User-Agent", "LiteSound-Updater")

	resp, err := s.client.Do(req)
	if err != nil {
		return githubRelease{}, err
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		body, _ := io.ReadAll(io.LimitReader(resp.Body, 4*1024))
		return githubRelease{}, fmt.Errorf("query latest release failed: status %d: %s", resp.StatusCode, strings.TrimSpace(string(body)))
	}

	parsed := githubRelease{}
	if err := json.NewDecoder(resp.Body).Decode(&parsed); err != nil {
		return githubRelease{}, err
	}
	return parsed, nil
}

func pickInstallerAsset(assets []githubAssetBrief, goos string, goarch string) (githubAssetBrief, bool) {
	targetOS := strings.ToLower(strings.TrimSpace(goos))
	targetArch := strings.ToLower(strings.TrimSpace(goarch))
	if targetOS == "" || targetArch == "" {
		return githubAssetBrief{}, false
	}

	lowerPattern := targetOS + "-" + targetArch
	for _, asset := range assets {
		name := strings.ToLower(strings.TrimSpace(asset.Name))
		if name == "" {
			continue
		}
		if !strings.Contains(name, lowerPattern) {
			continue
		}
		if !strings.HasSuffix(name, ".exe") {
			continue
		}
		if !strings.Contains(name, "installer") {
			continue
		}
		if strings.TrimSpace(asset.BrowserDownloadURL) == "" {
			continue
		}
		return asset, true
	}
	return githubAssetBrief{}, false
}

func parseSHA256Digest(value string) string {
	raw := strings.TrimSpace(value)
	if raw == "" {
		return ""
	}
	if strings.HasPrefix(strings.ToLower(raw), "sha256:") {
		raw = strings.TrimSpace(raw[len("sha256:"):])
	}
	if len(raw) != 64 {
		return ""
	}
	for _, ch := range raw {
		if !strings.ContainsRune("0123456789abcdefABCDEF", ch) {
			return ""
		}
	}
	return strings.ToLower(raw)
}

type versionCore struct {
	major int
	minor int
	patch int
}

func isNewerVersion(current string, latest string) bool {
	trimmedCurrent := strings.TrimSpace(current)
	trimmedLatest := strings.TrimSpace(latest)
	if trimmedCurrent == "" || strings.EqualFold(trimmedCurrent, "dev") {
		return false
	}
	currCore, currPre, currOK := parseVersion(trimmedCurrent)
	latestCore, latestPre, latestOK := parseVersion(trimmedLatest)
	if !currOK || !latestOK {
		return false
	}
	if latestCore.major != currCore.major {
		return latestCore.major > currCore.major
	}
	if latestCore.minor != currCore.minor {
		return latestCore.minor > currCore.minor
	}
	if latestCore.patch != currCore.patch {
		return latestCore.patch > currCore.patch
	}
	if currPre == "" && latestPre != "" {
		return false
	}
	if currPre != "" && latestPre == "" {
		return true
	}
	if currPre == latestPre {
		return false
	}
	return latestPre > currPre
}

func parseVersion(value string) (versionCore, string, bool) {
	raw := strings.TrimSpace(value)
	if raw == "" {
		return versionCore{}, "", false
	}
	raw = strings.TrimPrefix(raw, "v")
	raw = strings.TrimPrefix(raw, "V")
	corePart := raw
	preRelease := ""
	if idx := strings.Index(corePart, "+"); idx >= 0 {
		corePart = corePart[:idx]
	}
	if idx := strings.Index(corePart, "-"); idx >= 0 {
		preRelease = strings.TrimSpace(corePart[idx+1:])
		corePart = corePart[:idx]
	}
	chunks := strings.Split(corePart, ".")
	if len(chunks) < 3 {
		return versionCore{}, "", false
	}
	major, err := strconv.Atoi(strings.TrimSpace(chunks[0]))
	if err != nil || major < 0 {
		return versionCore{}, "", false
	}
	minor, err := strconv.Atoi(strings.TrimSpace(chunks[1]))
	if err != nil || minor < 0 {
		return versionCore{}, "", false
	}
	patch, err := strconv.Atoi(strings.TrimSpace(chunks[2]))
	if err != nil || patch < 0 {
		return versionCore{}, "", false
	}
	return versionCore{major: major, minor: minor, patch: patch}, preRelease, true
}

func isStableTag(value string) bool {
	_, preRelease, ok := parseVersion(value)
	if !ok {
		return false
	}
	return strings.TrimSpace(preRelease) == ""
}
