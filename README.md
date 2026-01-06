# LiteSound

LiteSound 是一款基于 Wails 的桌面音乐播放器（当前以 Windows 为主）。

## 主要功能

- 自动扫描本地音乐库
- 作曲者 / 专辑筛选
- 歌单管理
- 系统音量控制
- 全局快捷键（后台也可用）

## 使用方式

1. 将音乐文件放到系统「音乐」文件夹，或在设置中添加自定义音乐目录。
2. 启动 LiteSound，应用会自动扫描并展示音乐。

默认音乐文件夹（Windows）：

- `C:\Users\<你的用户名>\Music`

## 全局快捷键（Windows）

- 播放 / 暂停：`Ctrl + Alt + Space`
- 下一首：`Ctrl + Alt + →`
- 上一首：`Ctrl + Alt + ←`

## 支持的格式

`mp3`、`flac`、`wav`、`ogg`、`m4a`、`aac`

## 开发

```bash
pnpm install
pnpm run build
```

```bash
wails dev
```

## 发布

打 tag 会触发 GitHub Actions 生成 Release：

```bash
git tag -a v0.0.1 -m "v0.0.1"
git push origin v0.0.1
```
