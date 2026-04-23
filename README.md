# MusicZ - 极简专属桌面音乐盲盒 🎧

一款专为 Windows 系统深度打造的极简桌面端音乐探索枢纽。抛弃繁琐的主动搜索与歌单管理，核心主打“扭蛋盲盒”与“无限电台”式的随机探索体验，打破听歌信息茧房，让每一次播放都充满未知的惊喜。

## ✨ 核心特性 (v1.4 终极探索版)

* **🎰 扭蛋机音乐盲盒**
  真正的“一期一会”。内置强互动老虎机抽卡动效与 10 秒技能冷却机制（CD），一键抽取跨越时空的异次元电波（涵盖华语、赛博朋克、爵士、ACG 等数十种精选标签）。抛下歌单，交给命运。
* **♾️ 私人无限电台**
  独创“隐形水库”预加载机制。扫码登录后，算法会在后台暗中拆解并融合符合你口味的推荐歌单，实现私人推荐列表的**无限下滑**，好歌永不枯竭。
* **🛡️ 防疲劳去重系统**
  搭载极客级本地听歌黑名单算法，自动拦截历史已播歌曲，从物理层面上绝对杜绝听觉重复，逼迫系统为你挖掘新鲜血液。
* **📱 纯净扫码与身份标识**
  彻底规避滑块验证码风控。采用原生毛玻璃 UI 的高级扫码授权方案，Cookie 本地安全持久化。登录后解锁专属头像与尊贵 VIP 红名标识。
* **⚡ 丝滑微操引擎**
  底层采用 DOM 节点精准微操（Micro-Operations）渲染技术，告别切歌与暂停时的界面重绘闪烁。配合耳机呼吸灯特效，带来原生级应用般如丝般顺滑的沉浸感。
* **📦 开箱即用 & 自动进化**
  底层原生融合网易云 API 引擎，零门槛免配置。全面接入 GitHub Releases 全自动分发流水线，新版本后台静默下载，无缝平滑升级。

## 🚀 立即体验

进入 [Releases 页面](https://github.com/liovoz/MusicZ-Desktop/releases/latest)，下载最新的 `MusicZ Setup x.x.x.exe` 双击安装即可开启你的未知音乐之旅。

## 🛠️ 技术栈与驱动
* **框架**: Electron + 纯原生 JavaScript/HTML/CSS (无任何臃肿的前端框架)
* **引擎**: 深度集成 [NeteaseCloudMusicApi](https://github.com/Binaryify/NeteaseCloudMusicApi)
* **更新**: 基于 `electron-updater` 的全自动云端分发


# MusicZ 🎧

> 一款极简、纯粹、极具探索精神的 Windows 桌面级音乐播放器。

MusicZ 打破了传统音乐软件臃肿的结构，以“听你想听”和“未知探索”为核心产品哲学。采用极致通透的毛玻璃 (Glassmorphism) 视觉语言，结合流动声波渐变的“Z”字专属品牌标识，为你带来沉浸式的桌面听歌体验。

## ✨ 核心特性 (Features)

* **🎲 异次元音乐盲盒 (Blind Box)**
    抛下固化的歌单，交给命运。独创的音乐盲盒引擎，一键抽取未知曲风电波（支持 20+ 种流派），带你探索宇宙边缘的声音。
* **💎 智能无损音质引擎 (Smart SQ/Hi-Res)**
    底层集成专业级音质调度状态机。支持**标准 / 极高 / SQ无损 / Hi-Res极清**的无缝热切换。独家实现“优雅降级”策略，在版权或权限受限时，底噪 0 毫秒感知自动降级，并辅以纯白毛玻璃 Toast 全局幽灵轻提示。
* **🌫️ 纯粹的 UI 美学 (Glassmorphism)**
    摒弃一切多余的干扰元素，没有繁琐的账号注册流程，更不需要繁复的 API Key 输入。采用全局原生抗锯齿字体渲染，沉浸式界面随音乐情绪自然呼吸。
* **📱 无缝生态接入**
    内嵌网易云音乐安全扫码登录体系。一键解锁私人无限电台、每日专属推荐以及你的云端听歌记忆。
* **🚀 静默热更新 (OTA)**
    内置企业级自动更新引擎。只需一次安装，后续版本均在后台静默下载，并在最合适的时机平滑提示重启覆盖，始终保持最新体验。

## 🛠️ 技术栈 (Tech Stack)

* **框架**: [Electron](https://www.electronjs.org/) (提供稳定的桌面端原生系统级能力)
* **前端**: 原生 HTML5 + CSS3 + 现代 JavaScript (零框架负担，极致轻量)
* **后端流服务**: [NeteaseCloudMusicApi](https://github.com/Binaryify/NeteaseCloudMusicApi) (本地化无感桥接代理)
* **打包与分发**: `electron-builder` + `electron-updater`

## 📦 安装与使用 (Installation)

MusicZ 致力于提供开箱即用的极简体验，目前专注为 Windows 平台提供深度适配。

**普通用户：**
1. 访问本仓库的 [Releases 页面](../../releases)。
2. 下载带有 `Latest` 标签的最新版 `MusicZ Setup x.x.x.exe`。
3. 双击安装，即可享受纯粹的音乐之旅（软件后续将自动为你无缝更新）。

**开发者：**
如果你想在本地运行或二次开发 MusicZ，请确保已安装 [Node.js](https://nodejs.org/)。

```bash
# 1. 克隆仓库
git clone [https://github.com/liovoz/MusicZ-Desktop.git](https://github.com/你的用户名/MusicZ-Desktop.git)

# 2. 进入项目目录
cd MusicZ-Desktop

# 3. 安装依赖
npm install

# 4. 本地启动开发者模式
npm start

# 5. 构建 Windows 安装包
npm run build

🎯 交互设计哲学 (Design Philosophy)
MusicZ 在开发过程中始终践行“宽容型设计 (Forgiving UI)”：
从消除动画导致的一秒滚动条闪烁，到解决 Electron 失去焦点时的字体抗锯齿重影；从双状态机的数据流统一，到符合“费茨法则 (Fitts's Law)”的全局居中提示。我们不放过任何一个像素级的瑕疵，只为提供最自然的“指尖交互”。

🤝 贡献与反馈 (Contributing)
欢迎提交 Issue 或 Pull Request。如果你发现了任何反直觉的交互或视觉 Bug（哪怕只是偏离了 1 个像素），请随时反馈，我们将以最快速度进行修复打磨！

📄 开源协议 (License)
MIT License
