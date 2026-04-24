// ==========================================
// 核心配置文件与基础常量
// ==========================================
const API_BASE_URL = 'http://127.0.0.1:3000';

const ICON_PLAY_LARGE = '<svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.14v13.72a1 1 0 001.5.86l11.43-6.86a1 1 0 000-1.72L9.5 4.28a1 1 0 00-1.5.86z"/></svg>';
const ICON_PAUSE_LARGE = '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>';
const ICON_PLAY_SMALL = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
const ICON_PAUSE_SMALL = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';

const MODE_ICONS = {
    loop: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/></svg>',
    single: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/><text x="10.5" y="15.5" font-size="7" font-weight="bold" fill="currentColor">1</text></svg>',
    random: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/></svg>'
};
const MODE_TEXTS = { loop: '列表循环', single: '单曲循环', random: '随机播放' };
const PLAY_MODES = ['loop', 'single', 'random']; 

// ==========================================
// 全局状态机
// ==========================================
let displayList = []; 
let playingList = []; 
let currentPlayingIndex = -1;
let parsedLyrics = [];

let currentView = 'tabNew'; 
let currentPlaylistId = null; 
let isFetching = false;       
let lastSearchKeyword = '';

let privateReservoir = [];
let isFetchingReservoir = false;

let isBlindBoxMode = false;
let currentBlindBoxTag = '';
let cdRemaining = 0;
let cdTimer = null;
let isSlotting = false;

let preferredQuality = localStorage.getItem('mz_quality') || 'lossless';
let currentActualQuality = preferredQuality; 

let modeIdx = 0;
let isDraggingProgress = false;

// 【核心】：加入 hasMore 锁，控制无限滚动
const viewDataCache = { tabNew: [], tabPlaylist: [], tabSearch: [], playlistDetail: [], tabBlindBox: [] };
const pagination = { tabNew: { offset: 0, hasMore: true }, tabPlaylist: { offset: 0, hasMore: true }, tabSearch: { offset: 0, hasMore: true }, playlistDetail: { offset: 0, hasMore: true }};

// ==========================================
// DOM 元素引用
// ==========================================
const dataList = document.getElementById('dataList');
const listTitle = document.getElementById('listTitle');
const backBtn = document.getElementById('backBtn');
const tabBtns = document.querySelectorAll('.tab-btn');
const audioPlayer = document.getElementById('audioPlayer');
const searchInput = document.getElementById('searchInput');
const clearSearch = document.getElementById('clearSearch');
const searchBtn = document.getElementById('searchBtn');

const playlistToggleBtn = document.getElementById('playlistToggleBtn');
const playlistPanel = document.getElementById('playlistPanel');
const playlistCountBadge = document.getElementById('playlistCountBadge');
const panelHeaderCount = document.getElementById('panelHeaderCount');
const playlistPanelList = document.getElementById('playlistPanelList');
const clearPlaylistBtn = document.getElementById('clearPlaylistBtn');

const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const playPauseBtn = document.getElementById('playPauseBtn');
const progressBar = document.getElementById('progressBar');
const currentTimeText = document.getElementById('currentTimeText');
const durationText = document.getElementById('durationText');
const modeBtn = document.getElementById('modeBtn');

const qualityBtn = document.getElementById('qualityBtn');
const qualityPanel = document.getElementById('qualityPanel');
const qualityList = document.getElementById('qualityList');

const versionTag = document.getElementById('versionTag');

// ==========================================
// 辅助工具与状态存取
// ==========================================
function getLocalCookie() { return localStorage.getItem('ncm_cookie') || ''; }
function getPlayHistory() { return JSON.parse(localStorage.getItem('mz_history') || '[]'); }
function addPlayHistory(id) {
    let hist = getPlayHistory();
    if (!hist.includes(id)) hist.push(id);
    if (hist.length > 500) hist.shift(); 
    localStorage.setItem('mz_history', JSON.stringify(hist));
}
function formatTime(seconds) {
    if (isNaN(seconds)) return '00:00';
    const m = Math.floor(seconds / 60).toString().padStart(2, '0'); 
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) { 
        const j = Math.floor(Math.random() * (i + 1)); 
        [array[i], array[j]] = [array[j], array[i]]; 
    }
    return array;
}
function actualQualityDisplay(level) { 
    return level === 'standard' ? '标准' : (level === 'exhigh' ? '极高' : (level === 'lossless' ? '无损' : '极清')); 
}

// 💥【新增核心工具】：终极去重过滤器
function filterUniqueSongs(newSongs, existingSongs) {
    const existingIds = new Set(existingSongs.map(s => s.id));
    return newSongs.filter(song => {
        if (existingIds.has(song.id)) return false;
        existingIds.add(song.id); // 保证新数组内也没有重复
        return true;
    });
}

// ==========================================
// 弹窗与 UI 反馈引擎
// ==========================================
let toastTimer = null;
function showToast(message, isPersistent = false) {
    const toast = document.getElementById('toastNotification');
    const highlighted = message.replace(/【(.*?)】/g, '<span style="color: #ec4141;">$1</span>');
    toast.innerHTML = highlighted;
    toast.classList.remove('show');
    void toast.offsetWidth; 
    toast.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    if (!isPersistent) toastTimer = setTimeout(() => toast.classList.remove('show'), 3500); 
}

function showCustomAlert(message) {
    document.getElementById('customAlertMessage').innerText = message;
    const alertOverlay = document.getElementById('customAlert');
    alertOverlay.style.display = 'flex'; alertOverlay.offsetHeight; alertOverlay.classList.add('show');
}
document.getElementById('customAlertBtn').onclick = () => {
    const alertOverlay = document.getElementById('customAlert'); alertOverlay.classList.remove('show');
    setTimeout(() => { alertOverlay.style.display = 'none'; }, 300);
};

function showCustomConfirm(message, onConfirm) {
    document.getElementById('customConfirmMessage').innerText = message;
    const confirmOverlay = document.getElementById('customConfirm');
    confirmOverlay.style.display = 'flex'; confirmOverlay.offsetHeight; confirmOverlay.classList.add('show');
    document.getElementById('confirmOkBtn').onclick = () => { 
        confirmOverlay.classList.remove('show');
        setTimeout(() => { confirmOverlay.style.display = 'none'; onConfirm(); }, 300);
    };
    document.getElementById('confirmCancelBtn').onclick = () => {
        confirmOverlay.classList.remove('show');
        setTimeout(() => { confirmOverlay.style.display = 'none'; }, 300);
    };
}

// ==========================================
// 核心重装：带防呆超时（Watchdog）的全局控制舱
// ==========================================
const aboutModal = document.getElementById('aboutModal');
const closeAbout = document.getElementById('closeAbout');
const aboutActions = document.getElementById('aboutActions');
const updateNotesArea = document.getElementById('updateNotesArea');
const updateProgressArea = document.getElementById('updateProgressArea');
const newVersionTag = document.getElementById('newVersionTag');
const updateProgressBarFill = document.getElementById('updateProgressBarFill');
const updateProgressText = document.getElementById('updateProgressText');
const updateSpeedText = document.getElementById('updateSpeedText');

let updateState = 'idle'; 
let cachedUpdateInfo = null; 
let watchdogTimer = null; 

if (window.electronAPI) {
    versionTag.onclick = () => {
        aboutModal.style.display = 'flex'; void aboutModal.offsetWidth; aboutModal.classList.add('show');
        renderAboutUI(); 
    };

    closeAbout.onclick = () => {
        aboutModal.classList.remove('show');
        setTimeout(() => { aboutModal.style.display = 'none'; }, 300);
        if(updateState === 'checking' || updateState === 'up-to-date') updateState = 'idle';
    };

    function renderAboutUI() {
        updateNotesArea.style.display = 'none';
        updateProgressArea.style.display = 'none';
        aboutActions.innerHTML = '';

        if (updateState === 'idle') {
            aboutActions.innerHTML = `<button id="btnCheck" class="custom-alert-btn w-full">检查新版本</button>`;
            document.getElementById('btnCheck').onclick = () => {
                updateState = 'checking'; renderAboutUI();
                window.electronAPI.checkForUpdates();
                
                watchdogTimer = setTimeout(() => {
                    if (updateState === 'checking') {
                        updateState = 'idle'; renderAboutUI();
                        showToast('⏱️ 检查超时，星轨连接被阻断，请稍后再试');
                    }
                }, 15000);
            };
        } 
        else if (updateState === 'checking') {
            aboutActions.innerHTML = `<button class="custom-alert-btn w-full secondary" disabled style="opacity:0.7">🚀 正在连接星轨...</button>`;
        } 
        else if (updateState === 'up-to-date') {
            aboutActions.innerHTML = `<button class="custom-alert-btn w-full secondary" disabled>✨ 当前已是最新版本</button>`;
            setTimeout(() => { if (updateState === 'up-to-date') { updateState = 'idle'; renderAboutUI(); } }, 3000);
        } 
        else if (updateState === 'available') {
            updateNotesArea.style.display = 'block';
            newVersionTag.innerText = cachedUpdateInfo?.version || '未知';
            aboutActions.innerHTML = `
                <button id="btnCancel" class="custom-alert-btn secondary w-full">稍后再说</button>
                <button id="btnDownload" class="custom-alert-btn w-full">立即跃迁</button>
            `;
            document.getElementById('btnCancel').onclick = closeAbout.onclick;
            document.getElementById('btnDownload').onclick = () => {
                updateState = 'downloading'; renderAboutUI();
                window.electronAPI.downloadUpdate(); 
            };
        } 
        else if (updateState === 'downloading') {
            updateProgressArea.style.display = 'block';
            aboutActions.innerHTML = `<button class="custom-alert-btn w-full secondary" disabled style="opacity:0.5">正在拼命下载中...</button>`;
        } 
        else if (updateState === 'downloaded') {
            aboutActions.innerHTML = `<button id="btnRestart" class="custom-alert-btn w-full">立即重启以升华</button>`;
            document.getElementById('btnRestart').onclick = () => {
                document.getElementById('btnRestart').innerText = '正在涅槃...';
                window.electronAPI.quitAndInstall();
            };
        }
    }

    window.electronAPI.onUpdateAvailable((info) => {
        if (watchdogTimer) clearTimeout(watchdogTimer);
        cachedUpdateInfo = info; updateState = 'available'; renderAboutUI();
    });
    window.electronAPI.onUpdateNotAvailable(() => {
        if (watchdogTimer) clearTimeout(watchdogTimer);
        updateState = 'up-to-date'; renderAboutUI();
    });
    window.electronAPI.onUpdateError((err) => {
        if (watchdogTimer) clearTimeout(watchdogTimer);
        showToast('⚠️ 检查或下载受阻，请确保网络畅通');
        updateState = 'idle'; renderAboutUI();
    });
    window.electronAPI.onDownloadProgress((prog) => {
        if(updateState !== 'downloading') { updateState = 'downloading'; renderAboutUI(); }
        const percent = Math.floor(prog.percent || 0);
        const speed = (prog.bytesPerSecond / 1024).toFixed(1);
        updateProgressBarFill.style.width = `${percent}%`;
        updateProgressText.innerText = `正在接收数据：${percent}%`;
        updateSpeedText.innerText = speed > 1024 ? `${(speed/1024).toFixed(1)} MB/s` : `${speed} KB/s`;
    });
    window.electronAPI.onUpdateDownloaded((info) => {
        updateState = 'downloaded'; renderAboutUI();
        showToast('✨ 新世代跃迁包已就绪，随时可以升华');
    });
} else { versionTag.style.cursor = 'default'; }

// ==========================================
// 扫码登录引擎
// ==========================================
let qrCheckTimer = null;
document.getElementById('userProfile').onclick = () => {
    if (getLocalCookie()) {
        showCustomConfirm('确认要退出当前账号吗？\n退出后将无法获取私人定制推荐。', () => { 
            localStorage.removeItem('ncm_cookie'); location.reload(); 
        });
    } else { 
        document.getElementById('loginModal').style.display = 'flex';
        setTimeout(()=> document.getElementById('loginModal').classList.add('show'), 10);
        generateQrCode();
    }
};

document.getElementById('closeLogin').onclick = () => {
    document.getElementById('loginModal').classList.remove('show');
    setTimeout(()=> document.getElementById('loginModal').style.display = 'none', 300);
    clearInterval(qrCheckTimer);
};
document.getElementById('refreshQr').onclick = generateQrCode;

async function generateQrCode() {
    document.getElementById('qrStatusMask').classList.remove('active'); 
    document.getElementById('refreshQr').style.display = 'none';
    try {
        const resKey = await fetch(`${API_BASE_URL}/login/qr/key?t=${Date.now()}`);
        const dataKey = await resKey.json();
        const unikey = dataKey.data.unikey;
        const resImg = await fetch(`${API_BASE_URL}/login/qr/create?key=${unikey}&qrimg=true&t=${Date.now()}`);
        const dataImg = await resImg.json();
        document.getElementById('qrImg').src = dataImg.data.qrimg;
        startCheckingQrStatus(unikey);
    } catch (e) { showCustomAlert('网络异常，获取二维码失败'); }
}

function startCheckingQrStatus(key) {
    clearInterval(qrCheckTimer);
    qrCheckTimer = setInterval(async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/login/qr/check?key=${key}&t=${Date.now()}`);
            const data = await res.json();
            const mask = document.getElementById('qrStatusMask'); 
            const stText = document.getElementById('qrStatusText');
            if (data.code === 800) { 
                mask.classList.add('active'); stText.innerText = '二维码已失效'; 
                document.getElementById('refreshQr').style.display = 'block'; 
                clearInterval(qrCheckTimer); 
            } else if (data.code === 802) { 
                mask.classList.add('active'); stText.innerText = '扫码成功，请在手机上确认'; 
            } else if (data.code === 803) { 
                localStorage.setItem('ncm_cookie', data.cookie); 
                mask.classList.add('active'); stText.innerText = '✅ 登录成功！'; 
                clearInterval(qrCheckTimer); 
                setTimeout(() => { location.reload(); }, 1500); 
            }
        } catch(e){}
    }, 3000);
}

async function syncLoginStatus() {
    const cookie = getLocalCookie();
    if (!cookie) {
        qualityBtn.innerText = actualQualityDisplay(currentActualQuality);
        qualityBtn.classList.toggle('is-sq', currentActualQuality === 'lossless' || currentActualQuality === 'hires');
        return;
    }
    try {
        const res = await fetch(`${API_BASE_URL}/login/status?t=${Date.now()}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cookie }) });
        const data = await res.json();
        if (data.data && data.data.profile) {
            document.getElementById('userAvatar').src = data.data.profile.avatarUrl; 
            document.getElementById('userName').innerText = data.data.profile.nickname;
            document.getElementById('userStatus').innerText = '已解锁私人无限电台'; 
            document.getElementById('tabNew').innerText = '🎵 私人推荐';
            if (data.data.profile.vipType > 0) document.getElementById('userVipTag').style.display = 'inline-block';
        } else { localStorage.removeItem('ncm_cookie'); }
    } catch (e) { localStorage.removeItem('ncm_cookie'); }
    
    qualityBtn.innerText = actualQualityDisplay(currentActualQuality);
    qualityBtn.classList.toggle('is-sq', currentActualQuality === 'lossless' || currentActualQuality === 'hires');
}

// ==========================================
// 核心播放引擎与状态控制
// ==========================================
async function playSong(index, resumeTime = 0, forcePlay = true) {
    if (!playingList[index]) return;
    const song = playingList[index]; 
    currentPlayingIndex = index;
    
    if (resumeTime === 0) {
        addPlayHistory(song.id); 
        updatePlaylistBadge();
        document.getElementById('currentSongName').innerText = song.name; 
        document.getElementById('currentArtist').innerText = song.artist;
        document.getElementById('albumCover').src = song.cover + '?param=300y300'; 
        fetchLyric(song.id);
        
        progressBar.max = 0; progressBar.value = 0; updateProgressUI(); 
        currentTimeText.innerText = '00:00'; durationText.innerText = '00:00';
    }
    try {
        const cookie = getLocalCookie();
        const urlRes = await fetch(`${API_BASE_URL}/song/url/v1?id=${song.id}&level=${preferredQuality}${cookie ? '&cookie='+encodeURIComponent(cookie) : ''}`);
        const urlData = await urlRes.json();
        if (urlData.data && urlData.data[0] && urlData.data[0].url) {
            const actualLevel = urlData.data[0].level || 'standard'; 
            currentActualQuality = actualLevel;
            
            if (resumeTime > 0) {
                showToast(actualLevel !== preferredQuality ? `🎵 版权受限，已降级至【${actualQualityDisplay(actualLevel)}】` : `🎵 已切换至【${actualQualityDisplay(actualLevel)}】`);
            }
            
            qualityBtn.innerText = actualQualityDisplay(currentActualQuality);
            qualityBtn.classList.toggle('is-sq', currentActualQuality === 'lossless' || currentActualQuality === 'hires');
            
            audioPlayer.src = urlData.data[0].url; 
            if (resumeTime > 0) audioPlayer.currentTime = resumeTime; 
            if (forcePlay) audioPlayer.play();
        } else if (resumeTime === 0) { 
            showCustomAlert(`《${song.name}》无版权或需VIP，已跳过`); playNextSong(); 
        }
    } catch (e) {}
}

function playNextSong() {
    if (playingList.length === 0) return;
    let next = (currentPlayingIndex + 1) % playingList.length;
    if (PLAY_MODES[modeIdx] === 'random') next = Math.floor(Math.random() * playingList.length);
    playSong(next);
}

function playPrevSong() {
    if (playingList.length === 0) return;
    let prev = currentPlayingIndex - 1; 
    if (prev < 0) prev = playingList.length - 1;
    if (PLAY_MODES[modeIdx] === 'random') prev = Math.floor(Math.random() * playingList.length);
    playSong(prev);
}

playPauseBtn.onclick = () => { 
    if (playingList.length === 0) return showCustomAlert('当前播放列表为空，快去探索一些音乐吧~'); 
    if (audioPlayer.paused) audioPlayer.play(); else audioPlayer.pause(); 
};
nextBtn.onclick = playNextSong; 
prevBtn.onclick = playPrevSong; 
audioPlayer.onended = () => { if (PLAY_MODES[modeIdx] === 'single') audioPlayer.play(); else playNextSong(); };

modeBtn.onclick = function() {
    modeIdx = (modeIdx + 1) % PLAY_MODES.length;
    const currentMode = PLAY_MODES[modeIdx];
    this.innerHTML = MODE_ICONS[currentMode];
    this.title = MODE_TEXTS[currentMode];
    showToast(`已切换至【${MODE_TEXTS[currentMode]}】`);
};

// ==========================================
// 音频硬件事件回调
// ==========================================
audioPlayer.onloadedmetadata = () => { 
    if (!isNaN(audioPlayer.duration) && isFinite(audioPlayer.duration)) { 
        progressBar.max = audioPlayer.duration; 
        durationText.innerText = formatTime(audioPlayer.duration); 
    } else {
        progressBar.max = 0; durationText.innerText = "00:00";
    }
};

audioPlayer.onplay = () => { 
    playPauseBtn.innerHTML = ICON_PAUSE_LARGE; 
    playPauseBtn.classList.add('is-playing'); 
    
    if(currentView === 'tabBlindBox') {
        const icon = document.getElementById('blindBoxIcon');
        if(icon && icon.innerText === '🎧') icon.classList.add('icon-playing');
    } else {
        updateListPlayState();
    }
    updatePlaylistPanelState();
};

audioPlayer.onpause = () => { 
    playPauseBtn.innerHTML = ICON_PLAY_LARGE; 
    playPauseBtn.classList.remove('is-playing'); 
    
    if(currentView === 'tabBlindBox') {
        const icon = document.getElementById('blindBoxIcon');
        if(icon) icon.classList.remove('icon-playing');
    } else {
        updateListPlayState();
    }
    updatePlaylistPanelState();
};

// ==========================================
// 进度条与控制逻辑
// ==========================================
function updateProgressUI() { 
    let p = 0; if (progressBar.max > 0) p = (progressBar.value / progressBar.max) * 100; 
    progressBar.style.setProperty('--progress', `${p}%`); 
}

progressBar.onmousedown = (e) => { if (currentPlayingIndex === -1 || progressBar.max == 0) { e.preventDefault(); return; } isDraggingProgress = true; };
progressBar.oninput = () => { if (currentPlayingIndex === -1 || progressBar.max == 0) return; currentTimeText.innerText = formatTime(progressBar.value); updateProgressUI(); };
progressBar.onmouseup = () => { if (currentPlayingIndex === -1 || progressBar.max == 0) return; isDraggingProgress = false; audioPlayer.currentTime = progressBar.value; };

document.onkeydown = e => {
    if (e.target.tagName === 'INPUT') return;
    if (e.code === 'Space') { e.preventDefault(); playPauseBtn.click(); }
    if (e.code === 'ArrowLeft') playPrevSong(); 
    if (e.code === 'ArrowRight') playNextSong();
};

// ==========================================
// 歌词解析与滚动锚定
// ==========================================
async function fetchLyric(songId) {
    const lyricList = document.getElementById('lyricList'); 
    lyricList.innerHTML = '<li>歌词加载中...</li>'; parsedLyrics = [];
    try {
        const res = await fetch(`${API_BASE_URL}/lyric?id=${songId}`);
        const data = await res.json();
        if (data.lrc && data.lrc.lyric) {
            const lines = data.lrc.lyric.split('\n'); lyricList.innerHTML = ''; 
            lines.forEach(line => {
                const match = line.match(/\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/);
                if (match) {
                    const time = parseInt(match[1])*60 + parseInt(match[2]) + parseInt(match[3])/(match[3].length===2?100:1000);
                    const text = match[4].trim(); 
                    if (text) { 
                        parsedLyrics.push({ time, text }); 
                        const li = document.createElement('li'); li.innerText = text; lyricList.appendChild(li); 
                    }
                }
            });
        } else { lyricList.innerHTML = '<li>纯音乐 / 暂无歌词</li>'; }
    } catch (e) { lyricList.innerHTML = '<li>歌词加载失败</li>'; }
}

audioPlayer.ontimeupdate = () => {
    if (parsedLyrics.length > 0) {
        const currentTime = audioPlayer.currentTime; let activeIndex = -1;
        for (let i = 0; i < parsedLyrics.length; i++) { 
            if (currentTime >= parsedLyrics[i].time) activeIndex = i; else break; 
        }
        if (activeIndex !== -1) {
            const lis = document.getElementById('lyricList').querySelectorAll('li');
            lis.forEach(li => li.classList.remove('active')); 
            const currentLi = lis[activeIndex];
            if(currentLi) {
                currentLi.classList.add('active'); 
                const lyricBox = document.querySelector('.lyric-box');
                const boxHalfHeight = lyricBox.offsetHeight / 2; 
                const liCenter = currentLi.offsetTop + (currentLi.offsetHeight / 2);
                let offset = liCenter - boxHalfHeight; 
                if (offset < 0) offset = 0;
                document.getElementById('lyricList').style.transform = `translateY(-${offset}px)`;
            }
        }
    }
    if (!isDraggingProgress && progressBar.max > 0) { 
        progressBar.value = audioPlayer.currentTime; 
        currentTimeText.innerText = formatTime(audioPlayer.currentTime); 
        updateProgressUI(); 
    }
};

// ==========================================
// 播放列表与音质弹窗控制
// ==========================================
qualityBtn.onclick = (e) => {
    e.stopPropagation(); closePlaylistPanel();
    if (qualityPanel.classList.contains('show')) {
        qualityPanel.classList.remove('show');
        setTimeout(() => qualityPanel.style.display = 'none', 200);
    } else {
        qualityPanel.style.display = 'flex'; qualityPanel.offsetHeight; qualityPanel.classList.add('show');
        Array.from(qualityList.children).forEach(li => {
            if (li.dataset.level === currentActualQuality) li.classList.add('active'); else li.classList.remove('active');
        });
    }
};

qualityList.onclick = (e) => {
    const targetLi = e.target.closest('li');
    if (!targetLi) return;
    preferredQuality = targetLi.dataset.level; currentActualQuality = preferredQuality; 
    localStorage.setItem('mz_quality', preferredQuality);
    
    qualityPanel.classList.remove('show'); setTimeout(() => qualityPanel.style.display = 'none', 200);
    
    if (currentPlayingIndex !== -1 && playingList[currentPlayingIndex]) {
        playSong(currentPlayingIndex, audioPlayer.currentTime, !audioPlayer.paused); 
    } else {
        qualityBtn.innerText = actualQualityDisplay(currentActualQuality);
        qualityBtn.classList.toggle('is-sq', currentActualQuality === 'lossless' || currentActualQuality === 'hires');
    }
};

playlistToggleBtn.onclick = (e) => {
    e.stopPropagation(); 
    if (qualityPanel.classList.contains('show')) { qualityPanel.classList.remove('show'); setTimeout(() => qualityPanel.style.display = 'none', 200); }
    if (playlistPanel.classList.contains('show')) {
        closePlaylistPanel();
    } else {
        playlistPanel.style.display = 'flex'; playlistPanel.offsetHeight; playlistPanel.classList.add('show');
        renderPlaylistPanel(); scrollToCurrentSongInPanel(); 
    }
};

document.body.addEventListener('click', (e) => {
    if (playlistPanel.classList.contains('show') && !playlistPanel.contains(e.target) && !playlistToggleBtn.contains(e.target)) closePlaylistPanel();
    if (qualityPanel.classList.contains('show') && !qualityPanel.contains(e.target) && !qualityBtn.contains(e.target)) {
        qualityPanel.classList.remove('show'); setTimeout(() => qualityPanel.style.display = 'none', 200);
    }
});

function closePlaylistPanel() {
    playlistPanel.classList.remove('show');
    setTimeout(() => { if(!playlistPanel.classList.contains('show')) playlistPanel.style.display = 'none'; }, 300); 
}

function updatePlaylistBadge() { playlistCountBadge.innerText = isBlindBoxMode ? '∞' : playingList.length; }

function renderPlaylistPanel() {
    if (isBlindBoxMode) {
        panelHeaderCount.innerText = '∞';
        playlistPanelList.innerHTML = '<li class="active" style="justify-content:center;"><div class="panel-song-name" style="color:#ec4141;">🎧 正在接收异次元电波...</div></li>';
        return;
    }
    panelHeaderCount.innerText = playingList.length;
    if (playingList.length === 0) {
        playlistPanelList.innerHTML = '<li style="justify-content:center;color:#888;">队列为空</li>'; return;
    }
    playlistPanelList.innerHTML = '';
    playingList.forEach((song, index) => {
        const li = document.createElement('li');
        const isCurrent = index === currentPlayingIndex;
        const isAudioPlaying = isCurrent && !audioPlayer.paused;
        const prefixIcon = isCurrent ? (isAudioPlaying ? ICON_PAUSE_SMALL : ICON_PLAY_SMALL) : '';
        const vipTag = (song.fee === 1 || song.fee === 4) ? `<span class="vip-tag">VIP</span>` : '';
        let qualityTag = song.hr ? `<span class="hr-tag">Hi-Res</span>` : (song.sq ? `<span class="sq-tag">SQ</span>` : '');
        
        li.innerHTML = `<div class="panel-song-name">${prefixIcon}${song.name}${qualityTag}${vipTag}</div><div class="panel-song-artist">${song.artist}</div>`;
        if (isCurrent) li.classList.add('active');
        li.onclick = () => { if (isCurrent) { audioPlayer.paused ? audioPlayer.play() : audioPlayer.pause(); } else { playSong(index); } };
        playlistPanelList.appendChild(li);
    });
}

function scrollToCurrentSongInPanel() {
    if (currentPlayingIndex === -1 || playingList.length === 0 || isBlindBoxMode) return;
    setTimeout(() => {
        const activeLi = playlistPanelList.querySelector('li.active');
        if (activeLi) {
            const offset = activeLi.offsetTop - (playlistPanelList.clientHeight / 2) + (activeLi.clientHeight / 2);
            playlistPanelList.scrollTo({ top: offset, behavior: 'smooth' });
        }
    }, 50); 
}

function updatePlaylistPanelState() {
    if (!playlistPanel.classList.contains('show')) return;
    if (isBlindBoxMode) {
        const mysteryLi = playlistPanelList.querySelector('li.active');
        if(mysteryLi && currentPlayingIndex !== -1 && playingList[currentPlayingIndex]) {
            const isAudioPlaying = !audioPlayer.paused;
            const prefixIcon = isAudioPlaying ? ICON_PAUSE_SMALL : ICON_PLAY_SMALL;
            const nameSpan = mysteryLi.querySelector('.panel-song-name');
            if(nameSpan) nameSpan.innerHTML = `${prefixIcon}${playingList[currentPlayingIndex].name}`;
        }
        return;
    }
    const lis = playlistPanelList.querySelectorAll('li');
    lis.forEach((li, index) => {
        if(li.innerText === '队列为空') return;
        const isCurrentSong = index === currentPlayingIndex;
        const isAudioPlaying = isCurrentSong && !audioPlayer.paused;
        const nameSpan = li.querySelector('.panel-song-name'); if (!nameSpan) return;
        
        const song = playingList[index];
        const prefixIcon = isCurrentSong ? (isAudioPlaying ? ICON_PAUSE_SMALL : ICON_PLAY_SMALL) : '';
        const vipTag = (song.fee === 1 || song.fee === 4) ? `<span class="vip-tag">VIP</span>` : '';
        let qualityTag = song.hr ? `<span class="hr-tag">Hi-Res</span>` : (song.sq ? `<span class="sq-tag">SQ</span>` : '');
        
        nameSpan.innerHTML = `${prefixIcon}${song.name}${qualityTag}${vipTag}`;
        if (isCurrentSong) li.classList.add('active'); else li.classList.remove('active');
    });
}

clearPlaylistBtn.onclick = () => { 
    playingList = []; currentPlayingIndex = -1; 
    audioPlayer.pause(); audioPlayer.src = ''; 
    playPauseBtn.innerHTML = ICON_PLAY_LARGE; playPauseBtn.classList.remove('is-playing');
    document.getElementById('currentSongName').innerText = 'MusicZ'; 
    document.getElementById('currentArtist').innerText = '听你想听'; 
    document.getElementById('albumCover').src = 'https://s1.music.126.net/style/web2/img/default/default_album.jpg';
    document.getElementById('lyricList').innerHTML = '<li>欢迎使用MusicZ</li>'; parsedLyrics = []; document.getElementById('lyricList').style.transform = `translateY(0px)`;
    
    progressBar.max = 0; progressBar.value = 0; updateProgressUI(); 
    currentTimeText.innerText = '00:00'; durationText.innerText = '00:00';
    
    isBlindBoxMode = false; currentBlindBoxTag = ''; 
    currentActualQuality = preferredQuality;
    qualityBtn.innerText = actualQualityDisplay(currentActualQuality);
    qualityBtn.classList.toggle('is-sq', currentActualQuality === 'lossless' || currentActualQuality === 'hires');
    
    updatePlaylistBadge(); renderPlaylistPanel(); 
    
    if(currentView === 'tabSearch' && viewDataCache.tabSearch.length === 0) renderSearchEmptyUI();
    else if (currentView === 'tabBlindBox') renderBlindBoxUI();
    else renderList(listTitle.innerText, 'song'); 
};

// ==========================================
// 数据请求与列表渲染引擎
// ==========================================
function formatSongs(rawList, source) {
    return rawList.map(item => {
        let song = { id: item.id, name: item.name, type: 'song' };
        let hasSq = false; let hasHr = false;
        if (source === 'cloudsearch' || source === 'playlistDetail' || source === 'recommend') {
            song.artist = item.ar ? item.ar[0].name : '未知'; song.cover = item.al ? item.al.picUrl : ''; song.fee = item.fee || 0; 
            hasSq = !!item.sq; hasHr = !!item.hr;
        } else if (source === 'newsong') {
            song.artist = item.song.artists[0].name; song.cover = item.picUrl; song.fee = (item.song && item.song.fee !== undefined) ? item.song.fee : 0; 
            hasSq = !!item.song.sqMusic; hasHr = !!item.song.hrMusic;
        }
        song.sq = hasSq; song.hr = hasHr;
        return song;
    });
}

function renderList(title, type, isAppend = false, newData = []) {
    if (currentView !== 'tabBlindBox') dataList.style.overflowY = 'auto'; 
    const prevScrollTop = dataList.scrollTop;
    
    if (!isAppend) { 
        listTitle.innerText = title; dataList.innerHTML = ''; 
        if (displayList.length === 0) { dataList.innerHTML = '<li style="justify-content:center;color:#888;">暂无数据</li>'; return; } 
    }
    
    const dataToRender = isAppend ? newData : displayList;
    dataToRender.forEach((item) => {
        const li = document.createElement('li');
        if (item.type === 'song') {
            const isCurrentSong = playingList.length > 0 && playingList[currentPlayingIndex] && playingList[currentPlayingIndex].id === item.id;
            const isAudioPlaying = isCurrentSong && !audioPlayer.paused;
            const icon = isCurrentSong ? (isAudioPlaying ? ICON_PAUSE_SMALL : ICON_PLAY_SMALL) : ICON_PLAY_SMALL;
            const vipTag = (item.fee === 1 || item.fee === 4) ? `<span class="vip-tag">VIP</span>` : '';
            let qTag = item.hr ? `<span class="hr-tag">Hi-Res</span>` : (item.sq ? `<span class="sq-tag">SQ</span>` : '');
            
            li.innerHTML = `<img src="${item.cover}?param=50y50" class="item-cover"><div class="item-info"><span class="item-name">${item.name}${qTag}${vipTag}</span><span class="item-sub">${item.artist}</span></div><span class="list-play-icon" style="${isCurrentSong?'color:inherit;':'color:#ccc;'} display:flex;">${icon}</span>`;
            if(isCurrentSong) li.classList.add('playing-now');
            
            li.onclick = () => { 
                isBlindBoxMode = false; playingList = [...displayList].filter(i => i.type === 'song'); 
                const newIdx = playingList.findIndex(s => s.id === item.id); 
                if (isCurrentSong) { audioPlayer.paused ? audioPlayer.play() : audioPlayer.pause(); } else playSong(newIdx); 
            };
        } else {
            li.innerHTML = `<img src="${item.cover}?param=50y50" class="item-cover"><div class="item-info"><span class="item-name">${item.name}</span><span class="item-sub">推荐歌单</span></div><span>➡️</span>`;
            li.onclick = () => fetchPlaylistDetail(item.id, item.name);
        }
        dataList.appendChild(li);
    });
    if (!isAppend) dataList.scrollTop = prevScrollTop;
}

function updateListPlayState() {
    if(currentView === 'tabBlindBox') return;
    const lis = dataList.querySelectorAll('li');
    lis.forEach((li, index) => {
        if (li.id === 'loadingMoreIndicator' || li.id === 'noMoreIndicator') return;
        const item = displayList[index]; if (!item || item.type !== 'song') return;

        const isCurrentSong = playingList.length > 0 && playingList[currentPlayingIndex] && playingList[currentPlayingIndex].id === item.id;
        const isAudioPlaying = isCurrentSong && !audioPlayer.paused;
        
        const iconSpan = li.querySelector('.list-play-icon'); 
        const badgeTags = li.querySelectorAll('.vip-tag, .sq-tag, .hr-tag');
        const subText = li.querySelector('.item-sub');

        if (isCurrentSong) {
            li.classList.add('playing-now');
            if (iconSpan) { iconSpan.innerHTML = isAudioPlaying ? ICON_PAUSE_SMALL : ICON_PLAY_SMALL; iconSpan.style.color = 'inherit'; }
            badgeTags.forEach(tag => { tag.style.color = 'white'; tag.style.borderColor = 'white'; });
            if (subText) subText.style.color = 'rgba(255,255,255,0.8)';
        } else {
            li.classList.remove('playing-now');
            if (iconSpan) { iconSpan.innerHTML = ICON_PLAY_SMALL; iconSpan.style.color = '#ccc'; }
            li.querySelectorAll('.vip-tag').forEach(t => { t.style.color = '#ec4141'; t.style.borderColor = '#ec4141'; });
            li.querySelectorAll('.sq-tag').forEach(t => { t.style.color = '#d4a35d'; t.style.borderColor = '#d4a35d'; });
            li.querySelectorAll('.hr-tag').forEach(t => { t.style.color = '#3b82f6'; t.style.borderColor = '#3b82f6'; });
            if (subText) subText.style.color = '#888';
        }
    });
}

// ==========================================
// 业务数据抓取与视图切换
// ==========================================
function switchTab(tabId) {
    tabBtns.forEach(btn => btn.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    backBtn.style.display = 'none'; currentView = tabId;
    
    if(tabId === 'tabBlindBox') {
        document.getElementById('listHeaderContainer').style.display = 'none'; dataList.style.overflowY = 'hidden'; 
    } else {
        document.getElementById('listHeaderContainer').style.display = 'flex'; dataList.style.overflowY = 'auto'; 
    }
}

document.getElementById('tabNew').onclick = () => {
    switchTab('tabNew');
    if (viewDataCache.tabNew.length > 0) { displayList = viewDataCache.tabNew; renderList(getLocalCookie() ? '为你的私人定制推荐' : '今日最热新歌', 'song'); } else fetchNewSongs();
};
document.getElementById('tabPlaylist').onclick = () => {
    switchTab('tabPlaylist');
    if (viewDataCache.tabPlaylist.length > 0) { displayList = viewDataCache.tabPlaylist; renderList('全网热门歌单', 'playlist'); } else fetchHotPlaylists();
};
document.getElementById('tabBlindBox').onclick = () => { switchTab('tabBlindBox'); renderBlindBoxUI(); };
document.getElementById('tabSearch').onclick = () => {
    switchTab('tabSearch');
    if (viewDataCache.tabSearch.length > 0) { displayList = viewDataCache.tabSearch; renderList(`"${lastSearchKeyword}" 的探索结果`, 'song'); } else renderSearchEmptyUI();
};

async function fillPrivateReservoir() {
    if (isFetchingReservoir || !getLocalCookie()) return;
    isFetchingReservoir = true;
    try {
        const res = await fetch(`${API_BASE_URL}/recommend/resource?cookie=${encodeURIComponent(getLocalCookie())}&t=${Date.now()}`);
        const data = await res.json();
        if (data.code === 200 && data.recommend && data.recommend.length > 0) {
            const playlists = data.recommend.slice(0, 3); let newTracks = [];
            for (let p of playlists) {
                const pRes = await fetch(`${API_BASE_URL}/playlist/track/all?id=${p.id}&limit=50&cookie=${encodeURIComponent(getLocalCookie())}`);
                const pData = await pRes.json(); newTracks = newTracks.concat(formatSongs(pData.songs, 'playlistDetail'));
            }
            const history = getPlayHistory();
            
            // 💥【去重升级】：利用 filterUniqueSongs 剔除历史歌单、当前列表和缓冲池中的所有重复项
            let validTracks = newTracks.filter(s => !history.includes(s.id));
            validTracks = filterUniqueSongs(validTracks, viewDataCache.tabNew);
            validTracks = filterUniqueSongs(validTracks, privateReservoir);

            privateReservoir = privateReservoir.concat(shuffleArray(validTracks));
        }
    } catch(e) {}
    isFetchingReservoir = false;
}

async function fetchNewSongs(isLoadMore = false) {
    currentView = 'tabNew'; const cookie = getLocalCookie();
    if (!isLoadMore) { pagination.tabNew = { offset: 0, hasMore: true }; viewDataCache.tabNew = []; dataList.innerHTML = '<li style="justify-content:center;">为您调制私人电波...</li>'; }
    try {
        if (cookie && !isLoadMore) {
            const res = await fetch(`${API_BASE_URL}/recommend/songs?cookie=${encodeURIComponent(cookie)}&t=${Date.now()}`);
            const data = await res.json();
            // 首屏获取也要执行绝对去重
            viewDataCache.tabNew = filterUniqueSongs(formatSongs(data.data.dailySongs, 'recommend'), []); 
            displayList = viewDataCache.tabNew; 
            renderList('为你的私人定制推荐', 'song');
            fillPrivateReservoir(); 
        } else {
            const res = await fetch(`${API_BASE_URL}/personalized/newsong?limit=10&offset=${pagination.tabNew.offset}`);
            const data = await res.json(); 
            const fetchedSongs = formatSongs(data.result, 'newsong');
            
            // 使用新去重方法
            const newSongs = filterUniqueSongs(fetchedSongs, viewDataCache.tabNew);

            if (newSongs.length === 0) { 
                pagination.tabNew.hasMore = false; 
                renderList('今日最热新歌', 'song', true, []); return; 
            }
            viewDataCache.tabNew = [...viewDataCache.tabNew, ...newSongs]; 
            displayList = viewDataCache.tabNew; 
            renderList('今日最热新歌', 'song', isLoadMore, newSongs);
        }
    } catch (e) { listTitle.innerText = '加载失败'; }
}

async function fetchHotPlaylists(isLoadMore = false) {
    currentView = 'tabPlaylist';
    if (!isLoadMore) { pagination.tabPlaylist = { offset: 0, hasMore: true }; viewDataCache.tabPlaylist = []; dataList.innerHTML = '<li style="justify-content:center;">加载中...</li>'; }
    try {
        const res = await fetch(`${API_BASE_URL}/top/playlist?limit=15&offset=${pagination.tabPlaylist.offset}`);
        const data = await res.json(); const fetchedPlaylists = data.playlists.map(p => ({ id: p.id, name: p.name, cover: p.coverImgUrl, type: 'playlist' }));
        pagination.tabPlaylist.offset += fetchedPlaylists.length;
        viewDataCache.tabPlaylist = [...viewDataCache.tabPlaylist, ...fetchedPlaylists]; displayList = viewDataCache.tabPlaylist; renderList('全网热门歌单', 'playlist', isLoadMore, fetchedPlaylists);
    } catch (e) { listTitle.innerText = '加载失败'; }
}

async function fetchPlaylistDetail(id, name, isLoadMore = false) {
    currentView = 'playlistDetail'; const cookie = getLocalCookie();
    if (!isLoadMore) { currentPlaylistId = id; pagination.playlistDetail = { offset: 0, hasMore: true }; viewDataCache.playlistDetail = []; dataList.innerHTML = '<li style="justify-content:center;">解析歌单中...</li>'; }
    try {
        const res = await fetch(`${API_BASE_URL}/playlist/track/all?id=${id}&limit=20&offset=${pagination.playlistDetail.offset}${cookie ? '&cookie='+encodeURIComponent(cookie) : ''}`);
        const data = await res.json(); const fetchedSongs = formatSongs(data.songs, 'playlistDetail');
        pagination.playlistDetail.offset += fetchedSongs.length;
        viewDataCache.playlistDetail = [...viewDataCache.playlistDetail, ...fetchedSongs]; displayList = viewDataCache.playlistDetail;
        backBtn.style.display = 'block'; backBtn.onclick = () => { switchTab('tabPlaylist'); displayList = viewDataCache.tabPlaylist; renderList('全网热门歌单', 'playlist'); };
        renderList(`歌单内容: ${name}`, 'song', isLoadMore, fetchedSongs);
    } catch (e) { listTitle.innerText = '歌单解析失败'; }
}

function renderSearchEmptyUI() {
    listTitle.innerText = '全网探索广场'; displayList = []; pagination.tabSearch.hasMore = false; 
    dataList.style.overflowY = 'hidden'; 
    dataList.innerHTML = `<div class="empty-search-container"><div class="empty-search-icon"><svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg></div><div class="empty-search-title">在这里，发现你想听的任何声音</div><div class="empty-search-desc">在上方输入歌曲名、歌手名或专辑名<br>敲击回车键，立即开始你的音乐探索。</div></div>`;
}

async function fetchSearch(isLoadMore = false, keyword = '') {
    currentView = 'tabSearch';
    if (!isLoadMore) { lastSearchKeyword = keyword; pagination.tabSearch = { offset: 0, hasMore: true }; viewDataCache.tabSearch = []; dataList.innerHTML = '<li style="justify-content:center;">全网探索中...</li>'; }
    try {
        const res = await fetch(`${API_BASE_URL}/cloudsearch?keywords=${lastSearchKeyword}&limit=20&offset=${pagination.tabSearch.offset}`);
        const data = await res.json(); let fetchedSongs = data.result && data.result.songs ? formatSongs(data.result.songs, 'cloudsearch') : [];
        pagination.tabSearch.offset += fetchedSongs.length;
        viewDataCache.tabSearch = [...viewDataCache.tabSearch, ...fetchedSongs]; displayList = viewDataCache.tabSearch; renderList(`"${lastSearchKeyword}" 的结果`, 'song', isLoadMore, fetchedSongs);
    } catch (e) { listTitle.innerText = '探索失败'; }
}

searchBtn.onclick = () => { const kw = searchInput.value.trim(); if (!kw) { switchTab('tabSearch'); renderSearchEmptyUI(); return; } switchTab('tabSearch'); fetchSearch(false, kw); };
searchInput.oninput = () => { clearSearch.style.display = searchInput.value.length > 0 ? 'flex' : 'none'; };
clearSearch.onclick = () => { searchInput.value = ''; clearSearch.style.display = 'none'; if(currentView === 'tabSearch') renderSearchEmptyUI(); };
searchInput.onkeypress = e => { if(e.key === 'Enter') searchBtn.click(); };

dataList.onscroll = () => { if (dataList.scrollHeight - dataList.scrollTop <= dataList.clientHeight + 20) loadMoreData(); };

// 💥【核心修复】：无限滚动的防重叠机制
async function loadMoreData() {
    if (isFetching || currentView === 'tabBlindBox') return; 
    isFetching = true;
    try {
        if (currentView === 'tabNew') {
            if (getLocalCookie()) {
                // 防线 1：如果已被标记为没有更多数据，立刻停止执行
                if (!pagination.tabNew.hasMore) return; 
                
                // 防呆：确保当前列表中没有处于加载状态的元素
                if (dataList.querySelector('.loading-more')) return;

                const loader = document.createElement('li'); 
                loader.id = 'loadingMoreIndicator'; loader.className = 'loading-more'; loader.innerText = '正在为您探索更多...';
                dataList.appendChild(loader); dataList.scrollTop = dataList.scrollHeight;
                
                if (privateReservoir.length < 20) await fillPrivateReservoir();
                
                const loaderEl = document.getElementById('loadingMoreIndicator');
                if (loaderEl) loaderEl.remove();

                if (privateReservoir.length > 0) {
                    const chunk = privateReservoir.splice(0, 20); 
                    // 拼接入列前，再次执行终极去重，坚决拒绝重复的音乐 ID
                    const uniqueChunk = filterUniqueSongs(chunk, viewDataCache.tabNew);
                    
                    if (uniqueChunk.length > 0) {
                        viewDataCache.tabNew = viewDataCache.tabNew.concat(uniqueChunk);
                        displayList = viewDataCache.tabNew; 
                        renderList('为你的私人定制推荐', 'song', true, uniqueChunk); 
                    }
                    if (privateReservoir.length < 50) fillPrivateReservoir(); 
                } else { 
                    // 防线 2：池子耗尽，打上断绝锁
                    pagination.tabNew.hasMore = false; 
                    // 物理视觉防呆：只允许列表中存在唯一的一句“结束语”
                    if (!dataList.querySelector('.no-more')) {
                        const noMore = document.createElement('li'); 
                        noMore.className = 'no-more'; 
                        noMore.innerText = '- 探索已达宇宙边缘，没有更多声音了 -'; 
                        dataList.appendChild(noMore); 
                    }
                }
            } else { 
                if (!pagination.tabNew.hasMore) return;
                await fetchNewSongs(true); 
            }
        }
        else if (currentView === 'tabPlaylist') {
            if(pagination.tabPlaylist.hasMore) await fetchHotPlaylists(true);
        }
        else if (currentView === 'tabSearch') {
            if(pagination.tabSearch.hasMore) await fetchSearch(true, lastSearchKeyword);
        }
        else if (currentView === 'playlistDetail') {
            if(pagination.playlistDetail.hasMore) await fetchPlaylistDetail(currentPlaylistId, listTitle.innerText.replace('歌单内容: ', ''), true);
        }
    } finally { isFetching = false; }
}

// ==========================================
// 盲盒引擎 (保持原有柔性软装重构逻辑)
// ==========================================
function renderBlindBoxUI() {
    let container = dataList.querySelector('.blind-box-container');
    if (!container) {
        dataList.innerHTML = `
            <div class="blind-box-container">
                <div id="blindBoxIcon" class="blind-box-icon">🎲</div>
                <div id="slotMachineText" class="slot-text" style="color:#ec4141; margin-bottom: 5px;">- 未知惊喜 -</div>
                <div id="blindBoxTitle" class="blind-box-title">未知的旋律，一期一会</div>
                <div id="blindBoxDesc" class="blind-box-desc">抛下歌单，交给命运。<br>摇动专属骰子，抽取一段跨越时空的音乐电波。</div>
                <button id="rollBtn" class="blind-box-btn">摇一摇，抽取今日曲风</button>
            </div>
        `;
        const rollBtn = document.getElementById('rollBtn');
        rollBtn.onclick = handleBlindBoxRoll;
    }

    const icon = document.getElementById('blindBoxIcon');
    const title = document.getElementById('blindBoxTitle');
    const desc = document.getElementById('blindBoxDesc');
    const slotText = document.getElementById('slotMachineText');
    const rollBtn = document.getElementById('rollBtn');

    if (isBlindBoxMode && playingList.length > 0) {
        const iconClass = audioPlayer.paused ? '' : 'icon-playing';
        icon.className = `blind-box-icon ${iconClass}`;
        icon.innerText = '🎧';
        slotText.innerText = `【 ${currentBlindBoxTag} 】`;
        title.innerText = '异次元电波已接通';
        title.style.color = '#333';
        desc.innerHTML = '不要看歌单，闭上眼睛，享受未知的音乐之旅。<br>遇到不喜欢的，直接使用快捷键或下一首按钮。';
    } else {
        icon.className = 'blind-box-icon';
        icon.innerText = '🎲';
        slotText.innerText = '- 未知惊喜 -';
        title.innerText = '未知的旋律，一期一会';
        desc.innerHTML = '抛下歌单，交给命运。<br>摇动专属骰子，抽取一段跨越时空的音乐电波。';
    }

    if (cdRemaining > 0) {
        rollBtn.classList.add('disabled');
        rollBtn.innerText = `重新装填磁带 (${cdRemaining}s)`;
    } else {
        rollBtn.classList.remove('disabled');
        rollBtn.innerText = (isBlindBoxMode && playingList.length > 0) ? '摇一摇，抽取新曲风' : '摇一摇，抽取今日曲风';
    }
}

async function handleBlindBoxRoll() {
    if (cdRemaining > 0 || isSlotting) return; 
    isSlotting = true; isBlindBoxMode = true; 
    
    const icon = document.getElementById('blindBoxIcon');
    const title = document.getElementById('blindBoxTitle');
    const slotText = document.getElementById('slotMachineText');
    const rollBtn = document.getElementById('rollBtn');

    if(title) title.innerText = '正在调配惊喜...';
    if(icon) { icon.innerText = '🎲'; icon.className = 'blind-box-icon icon-spinning'; }
    
    const blindBoxTags = ["华语", "欧美", "日语", "韩语", "流行", "摇滚", "民谣", "电子", "舞曲", "说唱", "轻音乐", "爵士", "乡村", "R&B/Soul", "古典", "民族", "英伦", "金属", "朋克", "蓝调", "雷鬼", "拉丁", "另类/独立", "New Age", "古风", "后摇", "Bossa Nova"];
    
    cdRemaining = 10; 
    if(rollBtn) rollBtn.classList.add('disabled');
    
    cdTimer = setInterval(() => {
        cdRemaining--; 
        if(rollBtn) rollBtn.innerText = `重新装填磁带 (${cdRemaining}s)`;
        if (cdRemaining <= 0) { 
            clearInterval(cdTimer); 
            if(rollBtn) { 
                rollBtn.innerText = '摇一摇，抽取新曲风'; 
                rollBtn.classList.remove('disabled'); 
            } 
        }
    }, 1000);

    let slotTimer = setInterval(() => { 
        if(slotText) slotText.innerText = blindBoxTags[Math.floor(Math.random() * blindBoxTags.length)]; 
    }, 70);

    setTimeout(async () => {
        clearInterval(slotTimer); 
        const finalTag = blindBoxTags[Math.floor(Math.random() * blindBoxTags.length)]; 
        currentBlindBoxTag = finalTag;
        
        if(slotText) { 
            slotText.innerText = `【 ${finalTag} 】`; 
            slotText.style.transform = 'scale(1.2)'; 
            setTimeout(() => { if(slotText) slotText.style.transform = 'scale(1)'; }, 300); 
        }
        
        try {
            const plRes = await fetch(`${API_BASE_URL}/top/playlist?cat=${encodeURIComponent(finalTag)}&limit=10`);
            const plData = await plRes.json();
            if (plData.playlists && plData.playlists.length > 0) {
                const randomPl = plData.playlists[Math.floor(Math.random() * plData.playlists.length)];
                const trackRes = await fetch(`${API_BASE_URL}/playlist/track/all?id=${randomPl.id}&limit=100${getLocalCookie() ? '&cookie='+encodeURIComponent(getLocalCookie()) : ''}`);
                const trackData = await trackRes.json();
                let fetchedSongs = formatSongs(trackData.songs, 'playlistDetail');
                const history = getPlayHistory(); fetchedSongs = fetchedSongs.filter(s => !history.includes(s.id));
                playingList = shuffleArray(fetchedSongs).slice(0, 50); 
                viewDataCache.tabBlindBox = playingList;
                
                if (currentView === 'tabBlindBox') { renderBlindBoxUI(); }
                if(playingList.length > 0) playSong(0);
            } else { 
                if(title) title.innerText = '电波干扰，没有找到该标签歌曲'; 
                if(icon) icon.className = 'blind-box-icon'; 
            }
        } catch(e) { 
            if(title) title.innerText = '网络断开，请重试'; 
            if(icon) icon.className = 'blind-box-icon'; 
        }
        isSlotting = false;
    }, 1200);
}

// ==========================================
// 系统初始化
// ==========================================
window.onload = async () => { 
    showToast('🚀 引擎满血复活，MusicZ 已就绪');
    await syncLoginStatus(); 
    fetchNewSongs(); 
};