import { app, BrowserWindow } from 'electron';
import path from 'node:path';
import { getDb } from './db/client';
import { registerIpcHandlers } from './ipc';
import { initUpdater } from './updater';

const isDev = !app.isPackaged;
const DEV_URL = 'http://localhost:5173';

function createWindow(): BrowserWindow {
  const window = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 960,
    minHeight: 600,
    title: 'Vita',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  if (isDev) {
    window.loadURL(DEV_URL);
    window.webContents.openDevTools({ mode: 'detach' });
  } else {
    window.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }

  window.webContents.once('did-finish-load', () => {
    initUpdater(window);
  });

  return window;
}

app.whenReady().then(() => {
  getDb();
  registerIpcHandlers();

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
