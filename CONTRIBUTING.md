## 欢迎贡献

感谢你对 LiteSound 的关注！欢迎任何形式的贡献：Bug 报告、功能建议、代码改进或文档完善。

在开始之前，请先阅读下面的本地开发与提交流程，能加速你的贡献被合并。

---

## 1. 准备开发环境

- 操作系统：仅支持 Windows。
- Node.js：推荐使用 Node.js LTS（>=18）。
- 包管理器：项目使用 `pnpm`。
- Go：需要安装 Go（建议 >=1.21）。
- Wails CLI：用于运行与打包桌面应用。

安装依赖（项目根目录）：

```powershell
# 安装 pnpm（若未安装）
npm i -g pnpm

# 安装依赖
pnpm install
```

安装 Wails CLI（全局）：

```powershell
go install github.com/wailsapp/wails/v2/cmd/wails@latest
```

---

## 2. 常用开发命令

- 启动开发（前后端一起）：

```powershell
wails dev
```

- 打包发布：

```powershell
wails build
```

---

## 3. 代码样式与格式化

- 前端：使用 Prettier 格式化（保存自动格式化）。
- Go：使用 `gofmt`。

如需手动格式化：

```powershell
# 前端
pnpm format

# Go
gofmt -w .
```

---

## 4. 项目开发介绍（快速上手）

以下为 LiteSound 的核心结构与主要实现，便于快速定位修改位置：

- 前端入口：`frontend/src/App.tsx`

  - 组合 UI 层（Header / Filters / TrackList / PlayerBar / PlaylistSidebar）。
  - 托盘菜单为自定义 UI（见 `TrayMenu`）。

- 组件结构：`frontend/src/components/`

  - `HeaderBar`：顶部栏 + 设置弹窗。
  - `FiltersBar`：作曲者 / 专辑筛选。
  - `TrackList`：歌曲列表。
  - `PlaylistSidebar`：歌单侧边栏。
  - `PlayerBar`：播放控制与进度条。
  - `TrayMenu`：托盘自定义菜单 UI。

- Hooks：`frontend/src/hooks/`

  - `useMusicLibrary`：加载本地音乐目录与筛选逻辑。
  - `usePlayer`：播放控制（Howler.js）与播放模式。
  - `usePlaylists`：歌单的创建与管理。
  - `useTheme`：主题切换（light/dark/system）。

- i18n：`frontend/src/locales/`

  - `config.ts` 定义多语言入口与 key 类型。
  - `zh-CN` / `en` 下按模块拆分词条。

- 后端（Go）：
  - `library.go`：扫描音乐目录与读取元数据。
  - `stream.go`：本地流媒体服务（供前端播放）。
  - `playlists.go`：歌单存储与操作。
  - `state.go`：保存播放状态、筛选条件、主题等。
  - `tray.go`：Windows 托盘逻辑（左键显示 / 右键打开自定义菜单）。
  - `hotkeys.go`：全局快捷键（Windows）。

---

## 5. 提交与 PR 规范

- 分支命名建议：`feat/xxx`、`fix/xxx`、`chore/xxx`。
- 提交信息建议使用 Conventional Commits（例如：`feat(player): add tray menu`）。
- 大改动建议先开 issue 说明。
- 确保本地能通过 `wails dev` 编译运行。

---

## 6. 报告 Bug / 提出建议

请提供尽可能详细的信息：重现步骤、系统版本、控制台日志、截图或录屏。

---

## 7. 目录结构（快速参考）

```
LiteSound/
├─ app.go
├─ library.go
├─ playlists.go
├─ state.go
├─ stream.go
├─ tray.go
├─ hotkeys.go
├─ build/
├─ frontend/
│  ├─ src/
│  │  ├─ App.tsx
│  │  ├─ components/
│  │  ├─ hooks/
│  │  ├─ locales/
│  │  ├─ utils/
│  │  └─ types/
│  └─ package.json
└─ wails.json
```
