const { app, BrowserWindow, dialog } = require('electron');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { autoUpdater } = require('electron-updater'); 

// 【底层安全防御】：提前创建 anonymous_token，防止 API 库首次运行崩溃
try {
    const tokenPath = path.join(os.tmpdir(), 'anonymous_token');
    if (!fs.existsSync(tokenPath)) {
        fs.writeFileSync(tokenPath, '', 'utf-8');
    }
} catch (e) {
    console.error('预创建 token 文件失败:', e);
}

// 引入内置网易云 API 引擎
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
        // 1. 尝试启动内置网易云 API 引擎
        await serveNcmApi({
            port: 3000,
            checkVersion: false
        });
        console.log('网易云 API 启动成功！');
        
        // 2. 只有 API 确认启动成功了，才打开主界面
        createWindow();

        // 3. 软件启动后，如果是打包后的版本，延迟 3 秒悄悄检查更新
        if (app.isPackaged) {
            setTimeout(() => {
                autoUpdater.checkForUpdatesAndNotify();
            }, 3000);
        }

    } catch (error) {
        // 如果后台崩溃，立刻弹窗报错
        dialog.showErrorBox('API 启动惨遭失败', '具体原因: ' + error.message);
    }
});

// ====== 自动更新事件监听 ======
if (app.isPackaged) {
    // 当后台静默下载完新版本后，弹出提示框让用户重启安装
    autoUpdater.on('update-downloaded', (info) => {
        dialog.showMessageBox({
            type: 'info',
            title: '🎉 发现新版本！',
            message: `MusicZ 最新版 ${info.version} 已经为你准备好了！`,
            detail: '是否立即重启软件体验新功能？（选择稍后则在下次打开软件时自动更新）',
            buttons: ['立即重启并更新', '稍后再说'],
            cancelId: 1
        }).then((result) => {
            if (result.response === 0) {
                autoUpdater.quitAndInstall();
            }
        });
    });

    autoUpdater.on('error', (err) => {
        console.error('自动更新出错: ', err);
    });
}

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});