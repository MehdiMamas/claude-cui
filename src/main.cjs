const { app, BrowserWindow, ipcMain, clipboard } = require('electron');
const path = require('node:path');
let window;
function openWindow() {
  window = new BrowserWindow({
    width: 480, height: 700, minWidth: 360, minHeight: 520,
    title: 'Claude CUI', backgroundColor: '#171916',
    webPreferences: { preload: path.join(__dirname, 'preload.cjs'), contextIsolation: true, nodeIntegration: false, sandbox: true }
  });
  window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  window.webContents.on('will-navigate', event => event.preventDefault());
  window.loadFile(path.join(__dirname, 'index.html'));
}
app.whenReady().then(() => {
  ipcMain.handle('copy-draft', (_event, text) => {
    if (typeof text !== 'string' || text.length > 1000000) throw new Error('Invalid draft');
    clipboard.writeText(text);
  });
  ipcMain.handle('pin-window', (_event, pinned) => {
    window.setAlwaysOnTop(pinned === true);
  });
  openWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) openWindow(); });
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
