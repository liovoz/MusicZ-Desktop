const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    // 网页主动向主进程发号施令
    checkForUpdates: () => ipcRenderer.send('check-for-updates'),
    quitAndInstall: () => ipcRenderer.send('quit-and-install'),
    
    // 网页监听主进程传来的广播情报
    onUpdateChecking: (callback) => ipcRenderer.on('update-checking', callback),
    onUpdateAvailable: (callback) => ipcRenderer.on('update-available', callback),
    onUpdateNotAvailable: (callback) => ipcRenderer.on('update-not-available', callback),
    onUpdateError: (callback) => ipcRenderer.on('update-error', callback),
    onUpdateDownloaded: (callback) => ipcRenderer.on('update-downloaded', callback)
});