const { app, BrowserWindow, ipcMain, session } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');

app.commandLine.appendSwitch('proxy-bypass-list', '127.0.0.1,localhost,<local>');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1050,
        height: 720,
        minWidth: 850,
        minHeight: 600,
        autoHideMenuBar: true, 
        icon: path.join(__dirname, 'icon.ico'),
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
            webSecurity: false 
        }
    });

    mainWindow.loadFile('index.html');
}

function startApiServer() {
    try {
        const server = require('NeteaseCloudMusicApi/server');
        server.serveNcmApi({ port: 3000, checkVersion: false }).then(() => {
            console.log('网易云 API 本地引擎已激活 (端口: 3000)');
        }).catch(err => {
            console.error('API 引擎启动异常:', err);
        });
    } catch (e) {
        console.error('未找到 NeteaseCloudMusicApi 核心模块:', e);
    }
}

app.whenReady().then(async () => {
    startApiServer();

    await session.defaultSession.setProxy({ mode: 'system' });
    autoUpdater.netSession = session.defaultSession;

    createWindow();

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});

// ==========================================
// 💥 自动更新终极逻辑 (手动授权模式)
// ==========================================
// 彻底关闭自动下载，剥夺独裁权
autoUpdater.autoDownload = false; 

ipcMain.on('check-for-updates', () => {
    autoUpdater.checkForUpdates().catch(err => {
        if (mainWindow) mainWindow.webContents.send('update-error', err.message);
    });
});

// 监听前端发来的“允许下载”指令
ipcMain.on('download-update', () => {
    autoUpdater.downloadUpdate().catch(err => {
        if (mainWindow) mainWindow.webContents.send('update-error', err.message);
    });
});

ipcMain.on('quit-and-install', () => {
    autoUpdater.quitAndInstall();
});

// 状态转发
autoUpdater.on('update-available', (info) => {
    if (mainWindow) mainWindow.webContents.send('update-available', info);
});
autoUpdater.on('update-not-available', (info) => {
    if (mainWindow) mainWindow.webContents.send('update-not-available', info);
});
autoUpdater.on('error', (err) => {
    if (mainWindow) mainWindow.webContents.send('update-error', err.message);
});
// 进度转发
autoUpdater.on('download-progress', (progressObj) => {
    if (mainWindow) mainWindow.webContents.send('download-progress', progressObj);
});
autoUpdater.on('update-downloaded', (info) => {
    if (mainWindow) mainWindow.webContents.send('update-downloaded', info);
});