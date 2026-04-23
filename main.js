const { app, BrowserWindow, dialog } = require('electron');
const fs = require('fs');
const os = require('os');
const path = require('path');

// 【核心补丁】：在网易云 API 启动前，提前帮它建好缺失的临时文件，防止它自己崩溃！
try {
    const tokenPath = path.join(os.tmpdir(), 'anonymous_token');
    if (!fs.existsSync(tokenPath)) {
        fs.writeFileSync(tokenPath, '', 'utf-8');
    }
} catch (e) {
    console.error('预创建 token 文件失败:', e);
}

// 补丁打完后，再安全地引入 API
const { serveNcmApi } = require('NeteaseCloudMusicApi/server');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 980,
        height: 720,
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
        }
    });
    mainWindow.loadFile('index.html');
}

app.whenReady().then(async () => {
    try {
        // 尝试启动内置网易云 API
        await serveNcmApi({
            port: 3000,
            checkVersion: false
        });
        console.log('网易云 API 启动成功！');
        
        // 只有 API 确认启动成功了，才打开主界面
        createWindow();
    } catch (error) {
        // 如果后台崩溃，立刻弹窗报错
        dialog.showErrorBox('API 启动惨遭失败', '具体原因: ' + error.message);
    }
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});