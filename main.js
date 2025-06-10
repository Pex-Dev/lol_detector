// ==============================
// #region Módulos y Constantes Globales
// ==============================
const { app, BrowserWindow, ipcMain } = require("electron");
const Store = require("electron-store").default;
const store = new Store();
const path = require("path");
const psList = require("ps-list").default;

const CHECKINTERVAL = 5000; // ms
let maxTimeMinutes = 60; // Tiempo máximo en minutos

// ==============================
// #region Variables Globales
// ==============================
let mainWindow = null;
let configWindow = null;
let lolActiveSince = null;
let noticeDisplayed = false;

// ==============================
// #region Ventanas
// ==============================
const createMainWindow = () => {
  mainWindow = new BrowserWindow({
    width: 256,
    height: 394,
    frame: false,
    transparent: true,
    icon: path.join(__dirname, "/renderer/sprites/icon.png"),
    webPreferences: {
      preload: path.join(__dirname, "/preload/preload.js"),
    },
  });

  mainWindow.menuBarVisible = false;

  mainWindow.on("blur", () => {
    // Truco para evitar el efecto de los bordes en la ventana
    setTimeout(() => {
      const bounds = mainWindow.getBounds();
      bounds.width += 1;
      mainWindow.setBounds(bounds);
      bounds.width -= 1;
      mainWindow.setBounds(bounds);
    }, 10);
  });

  mainWindow.loadFile("renderer/index.html");
};

const createConfigWindow = () => {
  if (configWindow) {
    configWindow.focus();
    return;
  }

  configWindow = new BrowserWindow({
    width: 260,
    height: 235,
    resizable: false,
    maximizable: false,
    icon: path.join(__dirname, "/renderer/sprites/icon.png"),
    webPreferences: {
      preload: path.join(__dirname, "/preload/preload.js"),
    },
  });

  configWindow.menuBarVisible = false;
  configWindow.loadFile("renderer/config.html");

  configWindow.on("close", () => {
    configWindow = null;
  });
};

// ==============================
// #region Funciones de Control
// ==============================
const focusWindow = () => {
  if (mainWindow.isMinimized()) {
    mainWindow.restore();
  }
  mainWindow.setAlwaysOnTop(true, "screen-saver");
  mainWindow.show();
  mainWindow.focus();
  mainWindow.moveTop();
};

// ==============================
// #region Electron Store
// ==============================
const getValue = (key) => store.get(key, null);

const setValue = (key, value) => {
  store.set(key, value);
  if (key === "limite") {
    maxTimeMinutes = value;
  }
  if (key === "volumen" && configWindow) {
    configWindow.webContents.send("get-volume", getValue("volumen"));
  }
};

// ==============================
// #region Verificación de League of Legends
// ==============================
const isLolRunning = async () => {
  const processList = await psList();
  return processList.some((p) => p.name.toLowerCase().includes("leagueclient"));
};

const startLolWatcher = () => {
  setInterval(async () => {
    const lolRunning = await isLolRunning();

    //Verificar que este lol corriendo
    if (lolRunning) {
      //Ver si ya estaba corriendo
      if (!lolActiveSince) {
        //Obtener hora en la que se comenzo a jugar
        lolActiveSince = Date.now();
        //Enviar aviso al renderer de que comenzo a jugar
        mainWindow.webContents.send("lol-started", lolActiveSince);
      } else {
        //Obtener minutos jugados
        const minutes = (Date.now() - lolActiveSince) / (1000 * 60);

        //Ver si paso el tiempo límite
        if (minutes >= maxTimeMinutes && !noticeDisplayed) {
          //Enviar aviso al renderer
          mainWindow.webContents.send("lol-exceeded");

          //Dar foco a la ventana
          focusWindow();

          //Quitar alwaysontop para que no se muestre la ventana sobres las otras
          mainWindow.setAlwaysOnTop(false);
          noticeDisplayed = true;
        }
      }
    } else {
      lolActiveSince = null;

      //Enviar aviso de lol cerrado
      mainWindow.webContents.send("lol-stopped");
      noticeDisplayed = false;
    }
  }, CHECKINTERVAL);
};

// ==============================
// #region Inicialización de la App
// ==============================
app.whenReady().then(() => {
  maxTimeMinutes = getValue("limite") ?? maxTimeMinutes;

  // Eventos del renderer
  ipcMain.handle("minimize", () => mainWindow.minimize());
  ipcMain.handle("close", () => app.quit());
  ipcMain.handle("open-config", () => createConfigWindow());
  ipcMain.handle("save-value", (event, key, value) => setValue(key, value));
  ipcMain.handle("get-value", (event, key) => getValue(key));
  ipcMain.handle("close-config", () => {
    if (configWindow) configWindow.close();
  });

  createMainWindow();

  mainWindow.webContents.on("did-finish-load", () => {
    mainWindow.webContents.send("get-volume", getValue("volumen"));
    startLolWatcher();
  });
});
