# MusicZ - 极简专属桌面音乐盲盒 🎧

> 一款极简、纯粹、极具探索精神的 Windows 桌面级音乐播放器。

MusicZ 打破了传统音乐软件臃肿的结构，以“听你想听”和“未知探索”为核心产品哲学。采用极致通透的毛玻璃 (Glassmorphism) 视觉语言，结合严格的语义化交互布局，为你带来零干扰的沉浸式桌面听歌体验。

## ✨ 核心特性 (Features)

* **🎲 异次元音乐盲盒 (Blind Box)**
    抛下固化的歌单，交给命运。独创的音乐盲盒引擎，一键抽取未知曲风电波（支持 20+ 种流派）。具备极客级防刷新 CD 冷却机制与“防剧透”隐秘播放列表，带你纯粹地探索宇宙边缘的声音。
* **💎 智能无损音质引擎 (Smart SQ/Hi-Res)**
    底层集成专业级音质调度状态机。支持**标准 / 极高 / SQ无损 / Hi-Res极清**的无缝热切换。独家实现“优雅降级”策略，在版权或权限受限时，自动降级至最高可用音质，保障播放永不中断。
* **🌫️ 纯粹的 UI 美学与交互 (Glassmorphism & UX)**
    摒弃一切多余的干扰元素。功能键实行严格的“逻辑归位”，播放控制（单曲/列表/随机）一站式集成于底部。交互反馈采用全局居中的**纯白毛玻璃 Toast 幽灵气泡**，遵循“用完即走，绝不打扰”的宽容型设计理念。
* **📱 无缝生态接入与零门槛**
    内嵌网易云音乐安全扫码登录体系。一键解锁私人无限电台、每日专属推荐。**彻底移除繁琐的 API Key 手动输入**，真正的开箱即用。
* **🚀 定制化 OTA 极静默更新**
    摒弃粗糙的系统原生弹窗。内置基于 IPC 跨进程通信的安全更新引擎，后台静默拉取 GitHub Releases。新版本就绪后，通过定制化的毛玻璃弹窗优雅提示。左下角版本号隐藏“检查更新”极客彩蛋，并辅以持久化异步状态追踪。

## 🛠️ 技术架构 (Architecture & Tech Stack)

MusicZ 坚持“零框架负担”的极简开发哲学，采用最严苛的安全架构：

* **核心框架**: [Electron](https://www.electronjs.org/) 
* **安全机制**: 严格执行 `contextIsolation: true` 与 `nodeIntegration: false`，通过专属 `preload.js` 桥接层实现前后端安全 IPC 通信。
* **渲染引擎**: 原生 HTML5 + CSS3 + 现代 JavaScript。双数据流状态机分离（重绘引擎与状态引擎严格物理隔离），辅以硬件加速 (`translateZ(0)`)，确保极速丝滑。
* **数据服务**: 本地化集成 [NeteaseCloudMusicApi](https://github.com/Binaryify/NeteaseCloudMusicApi) Node 核心驱动。
* **构建分发**: `electron-builder` + `electron-updater`。

## 📦 安装与使用 (Installation)

MusicZ 致力于提供最纯粹的 Windows 桌面端体验。

**普通用户体验：**
1. 访问本仓库的 [Releases 页面](../../releases)。
2. 下载带有 `Latest` 标签的最新版安装包（如 `MusicZ Setup 1.6.6.exe`）。
3. 双击安装，即刻享受纯粹的音乐之旅（软件后续将自动为你无缝热更新）。

**开发者构建：**
如果你想在本地运行或二次开发 MusicZ，请确保已安装 [Node.js](https://nodejs.org/)。

```bash
# 1. 克隆仓库
git clone [https://github.com/liovoz/MusicZ-Desktop.git](https://github.com/liovoz/MusicZ-Desktop.git)

# 2. 进入项目目录
cd MusicZ-Desktop

# 3. 安装底层依赖
npm install

# 4. 启动本地全栈开发者模式
npm start

# 5. 构建生成带专属 ICO 标识的 Windows 安装包
npm run build

🎯 我们的设计哲学 (Design Philosophy)
MusicZ 的每一行代码都在践行对细节的偏执：
从进度条底层的“防越界幽灵记忆锁”，到规避视觉撕裂的“右侧配重”排版；从防止 DOM 频繁重绘的 CSS 高亮状态机，到彻底消除锯齿的高清 ICO 资源图层配置。我们不放过任何一个破坏沉浸感的瑕疵，因为我们相信，好工具的最高境界是“感知不到工具的存在”。

🤝 参与贡献 (Contributing)
欢迎提交 Issue 或 Pull Request。如果你发现了任何反直觉的交互或视觉 Bug（哪怕只是偏离了 1 个像素的排版），请随时反馈，我们将以最快速度进行打磨！

📄 开源协议 (License)
MIT License
