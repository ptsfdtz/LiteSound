# LiteSound 开发文档

## 项目概述

LiteSound 是一个基于 Tauri + React 的轻量级桌面音乐播放器应用。项目采用现代化的技术栈，提供简洁美观的用户界面和流畅的用户体验。

### 项目信息

- **项目名称**: LiteSound (lite-sound)
- **版本**: 0.1.0
- **标识符**: com.ptsfdtz.lite-sound
- **仓库**: WeChat-LoveSim (dev 分支)
- **技术栈**: React 19 + TypeScript + Tauri 2 + Vite 7

---

## 技术栈

### 前端技术

- **框架**: React 19.2.0
- **语言**: TypeScript 5.8.3
- **构建工具**: Vite 7.2.4
- **CSS方案**: CSS Modules + Tailwind CSS 4.1.17
- **UI组件**: React Icons 5.5.0
- **工具函数**: clsx 2.1.1

### 后端技术

- **框架**: Tauri 2.9.4
- **语言**: Rust (edition 2021)
- **依赖**:
  - tauri-plugin-opener 2.5.2
  - serde 1.x
  - serde_json 1.x

### 开发工具

- **代码规范**: 
  - ESLint 9.39.1
  - Prettier 3.6.2
  - Stylelint 16.26.0
- **Git钩子**: Husky 9.1.7 + lint-staged 16.2.7
- **提交规范**: Commitlint (conventional)

---

## 项目结构

```
lite-player/
├── public/                    # 静态资源目录
├── src/                       # 前端源代码
│   ├── components/            # React 组件
│   │   ├── common/            # 通用组件
│   │   │   ├── icon-button/   # 图标按钮组件
│   │   │   ├── select/        # 选择框组件
│   │   │   └── theme-modal/   # 主题设置模态框
│   │   ├── filter-bar/        # 过滤栏组件
│   │   ├── footer/            # 底部控制栏
│   │   ├── header/            # 顶部标题栏
│   │   ├── now-playing/       # 当前播放信息展示
│   │   ├── queue/             # 播放队列组件
│   │   └── sider/             # 侧边栏组件
│   ├── api/                   # API 接口层（待实现）
│   ├── constants/             # 常量定义
│   ├── data/                  # 数据层（待实现）
│   ├── hooks/                 # 自定义 React Hooks
│   ├── store/                 # 状态管理（待实现）
│   ├── types/                 # TypeScript 类型定义
│   ├── utils/                 # 工具函数
│   ├── App.tsx                # 主应用组件
│   ├── App.module.css         # 主应用样式
│   ├── main.tsx               # 应用入口
│   ├── main.css               # 全局样式
│   └── vite-env.d.ts          # Vite 类型声明
├── src-tauri/                 # Tauri 后端代码
│   ├── src/
│   │   ├── lib.rs             # 库入口，包含 Tauri 命令
│   │   └── main.rs            # 主程序入口
│   ├── capabilities/          # Tauri 权限配置
│   ├── icons/                 # 应用图标
│   ├── target/                # Rust 构建输出
│   ├── build.rs               # 构建脚本
│   ├── Cargo.toml             # Rust 依赖配置
│   └── tauri.conf.json        # Tauri 配置文件
├── eslint.config.cjs          # ESLint 配置
├── postcss.config.cjs         # PostCSS 配置
├── tailwind.config.cjs        # Tailwind CSS 配置
├── tsconfig.json              # TypeScript 配置
├── tsconfig.node.json         # Node 环境 TypeScript 配置
├── vite.config.ts             # Vite 配置
├── package.json               # npm 依赖配置
├── pnpm-lock.yaml             # pnpm 锁文件
└── README.md                  # 项目说明（待完善）
```

---

## 核心功能模块

### 1. 音频播放控制

- **文件**: `src/hooks/useAudioPlayer.ts`
- **功能**:
  - 播放/暂停控制
  - 上一曲/下一曲切换
  - 播放进度控制
  - 音量控制
  - 曲目选择

### 2. 主题管理

- **文件**: `src/hooks/useTheme.ts`
- **功能**:
  - 明暗主题切换
  - 主题持久化（localStorage）
  - 动态应用主题样式

### 3. 用户界面组件

#### HeaderBar（顶部栏）
- 显示应用标题
- 搜索功能
- 窗口控制（最小化、最大化、关闭）
- 设置按钮

#### NowPlaying（正在播放）
- 显示专辑封面
- 显示曲目信息（标题、艺术家）
- 播放进度条
- 音质标签（FLAC、Offline等）

#### Queue（播放队列）
- 显示曲目列表
- 高亮当前播放曲目
- 点击切换曲目

#### FooterControls（底部控制）
- 播放控制按钮（上一曲、播放/暂停、下一曲）
- 播放进度条
- 音量控制

#### Sider（侧边栏）
- 播放列表导航

---

## 类型定义

### Track（音轨）
```typescript
type Track = {
  title: string;      // 曲目标题
  artist: string;     // 艺术家
  duration: string;   // 时长（格式：mm:ss）
};
```

### Theme（主题）
```typescript
type Theme = 'light' | 'dark';
```

### PlayState（播放状态）
```typescript
type PlayState = {
  isPlaying: boolean;    // 是否正在播放
  currentIndex: number;  // 当前曲目索引
  progress: number;      // 播放进度（0-100）
  volume: number;        // 音量（0-100）
};
```

---

## 开发指南

### 环境要求

- **Node.js**: >= 18.x
- **pnpm**: >= 8.x
- **Rust**: 最新稳定版
- **操作系统**: Windows/macOS/Linux

### 安装依赖

```bash
# 安装前端依赖
pnpm install

# 安装 Tauri CLI（如果尚未安装）
cargo install tauri-cli
```

### 开发命令

```bash
# 启动开发服务器（前端）
pnpm dev

# 启动 Tauri 开发模式（前端 + 后端）
pnpm tauri dev

# 代码格式化
pnpm format

# 代码格式检查
pnpm format:check

# ESLint 检查和修复
pnpm lint

# CSS/SCSS 样式检查和修复
pnpm stylelint
```

### 构建命令

```bash
# 构建前端（生产模式）
pnpm build

# 构建 Tauri 应用
pnpm tauri build
```

---

## 代码规范

### 文件组织

1. **组件文件**: 每个组件放在独立目录，包含 `.tsx` 和 `.module.css` 文件
2. **类型定义**: 统一放在 `src/types/` 目录
3. **常量**: 统一放在 `src/constants/` 目录
4. **工具函数**: 统一放在 `src/utils/` 目录
5. **自定义 Hooks**: 统一放在 `src/hooks/` 目录

### 命名规范

- **组件**: PascalCase（如 `FooterControls.tsx`）
- **文件名**: kebab-case 或 PascalCase
- **CSS Modules**: camelCase（如 `styles.headerBar`）
- **常量**: UPPER_SNAKE_CASE（如 `DEFAULT_VOLUME`）
- **函数**: camelCase（如 `handleTogglePlay`）

### 导入顺序

1. React 相关
2. 第三方库
3. 组件
4. Hooks
5. 类型
6. 常量
7. 工具函数
8. 样式文件

### 组件结构

```typescript
// 1. 导入
import { useState } from 'react';
import type { Track } from '../../types';
import styles from './Component.module.css';

// 2. 类型定义
type ComponentProps = {
  // ...
};

// 3. 组件实现
function Component({ prop1, prop2 }: ComponentProps) {
  // 3.1 Hooks
  const [state, setState] = useState();
  
  // 3.2 事件处理函数
  const handleClick = () => {
    // ...
  };
  
  // 3.3 渲染
  return (
    <div className={styles.component}>
      {/* ... */}
    </div>
  );
}

// 4. 导出
export default Component;
```

---

## Git 工作流

### 提交规范

项目使用 Conventional Commits 规范：

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Type 类型**:
- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式调整（不影响功能）
- `refactor`: 代码重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建/工具链相关

**示例**:
```bash
feat(player): add volume control feature
fix(ui): correct header alignment issue
docs(readme): update installation guide
```

### 分支策略

- `main`: 主分支，稳定版本
- `dev`: 开发分支（当前分支）
- `feature/*`: 功能分支
- `fix/*`: 修复分支

---

## 配置说明

### Tauri 配置 (`src-tauri/tauri.conf.json`)

```json
{
  "app": {
    "windows": [{
      "title": "LiteSound",      // 窗口标题
      "width": 1200,             // 窗口宽度
      "height": 800,             // 窗口高度
      "center": true,            // 居中显示
      "decorations": false,      // 无原生标题栏
      "resizable": false         // 不可调整大小
    }]
  }
}
```

### Vite 配置 (`vite.config.ts`)

- 开发服务器端口: 1420
- HMR 端口: 1421
- 自动忽略 `src-tauri` 目录的文件变化

---

## 待开发功能

### 高优先级

- [ ] 实现真实的音频播放功能（替换当前的模拟实现）
- [ ] 添加文件系统集成，支持本地音乐文件导入
- [ ] 实现播放列表管理（增删改查）
- [ ] 添加音乐库扫描功能
- [ ] 实现歌词显示功能

### 中优先级

- [ ] 添加搜索功能实现
- [ ] 实现过滤功能（按艺术家、专辑等）
- [ ] 添加音频可视化（频谱等）
- [ ] 支持多种音频格式（MP3、FLAC、WAV等）
- [ ] 实现播放历史记录

### 低优先级

- [ ] 添加在线音乐服务集成
- [ ] 实现均衡器功能
- [ ] 添加快捷键支持
- [ ] 支持皮肤/主题自定义
- [ ] 实现插件系统

---

## 性能优化建议

1. **组件优化**:
   - 使用 `React.memo` 避免不必要的重渲染
   - 使用 `useMemo` 和 `useCallback` 优化计算和回调

2. **资源加载**:
   - 实现图片懒加载
   - 优化大型播放列表的虚拟滚动

3. **状态管理**:
   - 考虑引入 Zustand 或 Jotai 进行全局状态管理
   - 避免过度使用 Context 导致性能问题

---

## 故障排查

### 常见问题

1. **Tauri 窗口无法打开**
   - 检查 Rust 工具链是否正确安装
   - 确认 `src-tauri/target/` 目录权限

2. **热更新不工作**
   - 检查端口 1420 和 1421 是否被占用
   - 重启开发服务器

3. **样式不生效**
   - 确认 CSS Modules 文件命名正确（`.module.css`）
   - 检查 Tailwind 配置是否包含源文件路径

---

## 贡献指南

1. Fork 本项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: add some amazing feature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

---

## 许可证

待定

---

## 联系方式

- **仓库**: WeChat-LoveSim
- **所有者**: ptsfdtz
- **分支**: dev

---

## 更新日志

### [0.1.0] - 2025-12-06

#### 新增
- 初始项目结构搭建
- 基础 UI 组件实现
- 模拟音频播放功能
- 主题切换功能
- 自定义窗口控制

#### 优化
- 代码结构重构
- 提取公共类型定义
- 创建自定义 Hooks
- 完善开发文档

---

*最后更新: 2025年12月6日*
