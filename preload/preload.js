const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("lolAPI", {
  onLolStarted: (callback) => ipcRenderer.on("lol-started", callback),
  onLolStopped: (callback) => ipcRenderer.on("lol-stopped", callback),
  onLolExceeded: (callback) => ipcRenderer.on("lol-exceeded", callback),
  onGetVolume: (callback) => ipcRenderer.on("get-volume", callback),
  minimize: () => ipcRenderer.invoke("minimize"),
  close: () => ipcRenderer.invoke("close"),
  openConfig: () => ipcRenderer.invoke("open-config"),
  saveValue: (key, value) => ipcRenderer.invoke("save-value", key, value),
  getValue: (key) => ipcRenderer.invoke("get-value", key),
  closeConfig: () => ipcRenderer.invoke("close-config"),
});
