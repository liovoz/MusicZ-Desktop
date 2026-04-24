const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { autoUpdater } = require('electron-updater'); 

try {
    const tokenPath = path.join(os.tmpdir(), 'anonymous_token');
    if (!fs.existsSync(tokenPath)) {
        fs.writeFileSync(tokenPath, '', 'utf-8');
    }
} catch (e) {
    console.error('预创建 token 文件失败:', e);
}

const { serveNcmApi } = require('NeteaseCloudMusicApi/server');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1020, 
        height: 720,
        autoHideMenuBar: true,
        icon: path.join(__dirname, 'icon.ico'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js') 
        }
    });
    mainWindow.loadFile('index.html');
}

app.whenReady().then(async () => {
    try {
        await serveNcmApi({ port: 3000, checkVersion: false });
        console.log('网易云 API 启动成功！');
        createWindow();

        if (app.isPackaged) {
            setTimeout(() => { autoUpdater.checkForUpdatesAndNotify(); }, 3000);
        }
    } catch (error) {
        dialog.showErrorBox('API 启动惨遭失败', '具体原因: ' + error.message);
    }
});

if (app.isPackaged || true) { // 此处临时改为 true，方便在开发模式下也能分发事件给前端进行 UI 测试
    ipcMain.on('check-for-updates', () => { 
        if (app.isPackaged) {
            autoUpdater.checkForUpdates(); 
        } else {
            // 【核心重构】：本地开发模式模拟返回，防止前端按钮点击后死寂
            setTimeout(() => {
                if(mainWindow) mainWindow.webContents.send('update-not-available', { version: 'Dev-Mode' });
            }, 1500);
        }
    });
    
    ipcMain.on('quit-and-install', () => { autoUpdater.quitAndInstall(); });

    autoUpdater.on('checking-for-update', () => {
        if(mainWindow) mainWindow.webContents.send('update-checking');
    });
    autoUpdater.on('update-available', (info) => {
        if(mainWindow) mainWindow.webContents.send('update-available', info);
    });
    autoUpdater.on('update-not-available', (info) => {
        if(mainWindow) mainWindow.webContents.send('update-not-available', info);
    });
    autoUpdater.on('error', (err) => {
        if(mainWindow) mainWindow.webContents.send('update-error', err == null ? "网络连接异常" : err.message);
    });
    autoUpdater.on('update-downloaded', (info) => {
        if(mainWindow) mainWindow.webContents.send('update-downloaded', info);
    });
}

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});