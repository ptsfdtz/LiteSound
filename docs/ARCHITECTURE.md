# LiteSound 项目架构文档

## 架构概览

LiteSound 采用经典的桌面应用架构，由前端（React + TypeScript）和后端（Tauri + Rust）两部分组成。

```
┌─────────────────────────────────────────────────┐
│                   用户界面层                     │
│    (React Components + CSS Modules)             │
├─────────────────────────────────────────────────┤
│                   业务逻辑层                     │
│         (Custom Hooks + State Management)       │
├─────────────────────────────────────────────────┤
│                   数据层                         │
│         (API Layer + Data Models)               │
├─────────────────────────────────────────────────┤
│                   IPC 通信层                     │
│              (Tauri Commands)                   │
├─────────────────────────────────────────────────┤
│                   系统层                         │
│        (Rust + OS Native APIs)                  │
└─────────────────────────────────────────────────┘
```

---

## 前端架构

### 组件层次结构

```
App (主应用容器)
├── HeaderBar (顶部栏)
│   ├── SearchInput
│   ├── SettingsButton
│   └── WindowControls (最小化/最大化/关闭)
├── Sider (侧边栏)
│   └── PlaylistList
├── Main (主内容区)
│   ├── NowPlaying (正在播放)
│   │   ├── AlbumCover
│   │   ├── TrackInfo
│   │   └── ProgressBar
│   └── Queue (播放队列)
│       ├── FilterBar
│       └── TrackList
├── FooterControls (底部控制)
│   ├── TransportControls (播放控制)
│   ├── ProgressBar
│   └── VolumeControl
└── ThemeModal (主题设置弹窗)
    └── ThemeSelector
```

### 数据流

```
用户操作
    ↓
事件处理器 (Event Handler)
    ↓
自定义 Hook (useAudioPlayer, useTheme)
    ↓
状态更新 (State Update)
    ↓
UI 重新渲染 (Re-render)
```

### 状态管理

#### 本地状态 (Component State)
- 组件内部 UI 状态
- 表单输入状态
- 临时 UI 交互状态

#### 共享状态 (Shared State via Hooks)
- **useAudioPlayer**: 音频播放相关状态
  - currentIndex: 当前播放索引
  - progress: 播放进度
  - volume: 音量
  - isPlaying: 播放状态
  
- **useTheme**: 主题相关状态
  - theme: 当前主题 (light/dark)

#### 未来扩展：全局状态管理
建议使用 Zustand 或 Jotai 管理以下状态：
- 音乐库数据
- 播放列表
- 用户设置
- 应用配置

---

## 后端架构

### Tauri 命令系统

```rust
// 前端调用
invoke('command_name', { param: value })
    ↓
// Rust 处理
#[tauri::command]
fn command_name(param: Type) -> Result<ReturnType> {
    // 业务逻辑
}
    ↓
// 返回结果到前端
```

### 当前实现的命令

```rust
// 示例命令
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}
```

### 计划实现的命令

```rust
// 文件系统操作
#[tauri::command]
fn scan_music_directory(path: String) -> Result<Vec<Track>>

#[tauri::command]
fn read_audio_metadata(path: String) -> Result<AudioMetadata>

// 播放列表管理
#[tauri::command]
fn create_playlist(name: String) -> Result<Playlist>

#[tauri::command]
fn add_to_playlist(playlist_id: String, track_id: String) -> Result<()>

// 音频播放控制
#[tauri::command]
fn load_audio_file(path: String) -> Result<()>

#[tauri::command]
fn control_playback(action: PlaybackAction) -> Result<()>

// 设置管理
#[tauri::command]
fn save_settings(settings: Settings) -> Result<()>

#[tauri::command]
fn load_settings() -> Result<Settings>
```

---

## 模块职责划分

### src/components/ (UI 组件)
**职责**: 纯展示和基础交互
- 接收 props 渲染 UI
- 处理基础用户交互（点击、输入等）
- 不包含复杂业务逻辑

**命名规范**:
- 文件夹: kebab-case (如 `now-playing/`)
- 组件文件: PascalCase (如 `NowPlaying.tsx`)
- 样式文件: PascalCase.module.css (如 `NowPlaying.module.css`)

### src/hooks/ (自定义 Hooks)
**职责**: 封装可复用的状态逻辑
- 管理组件状态
- 处理副作用 (useEffect)
- 提供状态和操作方法

**命名规范**:
- 文件名: use + PascalCase (如 `useAudioPlayer.ts`)
- 导出函数: use + PascalCase (如 `export function useAudioPlayer()`)

### src/api/ (API 层)
**职责**: 与后端通信
- 封装 Tauri invoke 调用
- 处理错误和异常
- 数据格式转换

**示例结构**:
```typescript
// src/api/music.ts
export async function scanMusicDirectory(path: string): Promise<Track[]> {
  return await invoke('scan_music_directory', { path });
}

export async function getAudioMetadata(path: string): Promise<AudioMetadata> {
  return await invoke('read_audio_metadata', { path });
}
```

### src/types/ (类型定义)
**职责**: TypeScript 类型系统
- 定义数据结构
- 定义接口和类型
- 保证类型安全

**组织方式**:
```typescript
// src/types/index.ts - 导出所有类型
export * from './track';
export * from './playlist';
export * from './settings';

// src/types/track.ts - 单一职责
export type Track = { /* ... */ };
export type TrackMetadata = { /* ... */ };
```

### src/utils/ (工具函数)
**职责**: 纯函数工具
- 数据格式化
- 计算和转换
- 不包含副作用

**示例**:
```typescript
// src/utils/time.ts
export function formatTime(seconds: number): string { /* ... */ }
export function parseTime(timeString: string): number { /* ... */ }

// src/utils/audio.ts
export function calculateDuration(metadata: AudioMetadata): number { /* ... */ }
```

### src/constants/ (常量)
**职责**: 应用级常量
- 配置值
- 枚举值
- 静态数据

### src/store/ (状态管理) - 待实现
**职责**: 全局状态管理
- 应用级共享状态
- 复杂状态更新逻辑
- 状态持久化

---

## 关键技术决策

### 1. CSS 方案

**选择**: CSS Modules + Tailwind CSS

**理由**:
- CSS Modules: 避免样式冲突，组件级作用域
- Tailwind: 快速原型开发，一致的设计系统
- 两者结合: 平衡灵活性和开发效率

**使用建议**:
```tsx
// 组件特定样式使用 CSS Modules
import styles from './Component.module.css';

// 通用工具类使用 Tailwind
<div className={`${styles.container} flex items-center gap-4`}>
```

### 2. 状态管理

**当前**: useState + Custom Hooks

**适用场景**:
- 简单应用状态
- 组件间状态共享不频繁
- 状态逻辑相对独立

**未来升级路径**:
当应用复杂度增加时，考虑引入：
- **Zustand**: 轻量级，API 简单
- **Jotai**: 原子化状态，细粒度更新
- **Redux Toolkit**: 适合大型应用，标准化方案

### 3. 组件通信

**父子组件**: Props + Callbacks
```tsx
// 父组件
<Child value={value} onChange={handleChange} />

// 子组件
function Child({ value, onChange }: ChildProps) {
  return <input value={value} onChange={e => onChange(e.target.value)} />
}
```

**跨层级组件**: Context API (谨慎使用)
```tsx
const ThemeContext = createContext<Theme>('light');

function App() {
  return (
    <ThemeContext.Provider value={theme}>
      <DeepNestedComponent />
    </ThemeContext.Provider>
  );
}
```

**无关联组件**: 自定义事件 / 全局状态

### 4. 代码分割

**当前**: 单一构建包

**优化方向**:
```tsx
// 路由级代码分割
const Settings = lazy(() => import('./pages/Settings'));

// 组件级代码分割
const HeavyComponent = lazy(() => import('./components/HeavyComponent'));

// 使用 Suspense
<Suspense fallback={<Loading />}>
  <HeavyComponent />
</Suspense>
```

---

## 性能优化策略

### 1. React 优化

```tsx
// 1. 使用 memo 避免不必要渲染
const TrackItem = memo(function TrackItem({ track }: TrackItemProps) {
  return <div>{track.title}</div>;
});

// 2. 使用 useMemo 缓存计算结果
const sortedTracks = useMemo(() => {
  return tracks.sort((a, b) => a.title.localeCompare(b.title));
}, [tracks]);

// 3. 使用 useCallback 缓存函数
const handleClick = useCallback(() => {
  onSelect(track.id);
}, [track.id, onSelect]);
```

### 2. 虚拟滚动

对于大型播放列表，使用虚拟滚动：
```tsx
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={tracks.length}
  itemSize={60}
  width="100%"
>
  {({ index, style }) => (
    <div style={style}>
      <TrackItem track={tracks[index]} />
    </div>
  )}
</FixedSizeList>
```

### 3. 图片优化

```tsx
// 懒加载专辑封面
<img 
  src={coverUrl} 
  loading="lazy"
  alt={album}
/>

// 使用 placeholder
<img 
  src={coverUrl}
  placeholder="blur"
  blurDataURL={thumbnailUrl}
/>
```

---

## 安全考虑

### 1. Tauri 权限配置

```json
// src-tauri/capabilities/default.json
{
  "permissions": [
    "core:path:default",
    "core:window:default",
    "fs:read-all",
    "fs:scope:allow-read",
    "dialog:open"
  ]
}
```

### 2. 内容安全策略 (CSP)

```json
// tauri.conf.json
{
  "app": {
    "security": {
      "csp": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'"
    }
  }
}
```

### 3. 输入验证

```rust
#[tauri::command]
fn read_file(path: String) -> Result<String, String> {
    // 验证路径安全性
    if !path.starts_with("/safe/directory") {
        return Err("Invalid path".into());
    }
    
    // 读取文件
    std::fs::read_to_string(&path)
        .map_err(|e| e.to_string())
}
```

---

## 测试策略

### 1. 单元测试 (组件测试)

```tsx
import { render, screen } from '@testing-library/react';
import { TrackItem } from './TrackItem';

test('renders track title', () => {
  const track = { title: 'Test Song', artist: 'Test Artist' };
  render(<TrackItem track={track} />);
  expect(screen.getByText('Test Song')).toBeInTheDocument();
});
```

### 2. 集成测试 (Hooks 测试)

```tsx
import { renderHook, act } from '@testing-library/react';
import { useAudioPlayer } from './useAudioPlayer';

test('plays next track', () => {
  const { result } = renderHook(() => useAudioPlayer({ tracks }));
  
  act(() => {
    result.current.handleNext();
  });
  
  expect(result.current.currentIndex).toBe(1);
});
```

### 3. E2E 测试

使用 Playwright 或 Cypress 进行端到端测试。

---

## 部署流程

### 1. 构建前端

```bash
pnpm build
# 输出: dist/
```

### 2. 构建 Tauri 应用

```bash
pnpm tauri build
# 输出: src-tauri/target/release/
```

### 3. 平台特定打包

- **Windows**: `.exe` + `.msi`
- **macOS**: `.app` + `.dmg`
- **Linux**: `.AppImage` + `.deb`

---

## 维护指南

### 依赖更新

```bash
# 检查过期依赖
pnpm outdated

# 更新依赖
pnpm update

# 更新 Rust 依赖
cd src-tauri
cargo update
```

### 代码审查清单

- [ ] 遵循命名规范
- [ ] 类型定义完整
- [ ] 无 console.log 残留
- [ ] 无 TypeScript any 类型
- [ ] 组件 props 有类型定义
- [ ] 错误处理完善
- [ ] 添加必要注释
- [ ] 通过 ESLint 检查
- [ ] 通过 Prettier 格式化

---

*最后更新: 2025年12月6日*
