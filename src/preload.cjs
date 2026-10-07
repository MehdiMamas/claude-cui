const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('companion', {
  copy: text => ipcRenderer.invoke('copy-draft', text),
  pin: pinned => ipcRenderer.invoke('pin-window', pinned)
});
