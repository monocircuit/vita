import { app, BrowserWindow } from 'electron';
import path from 'node:path';
import { getDb } from './db/client';
import { registerIpcHandlers } from './ipc';

const isDev = !app.isPackaged;
const DEV_URL = 'http://localhost:3000';

function createWindow(): void {
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
    window.loadFile(path.join(__dirname, '..', 'out', 'index.html'));
  }
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
