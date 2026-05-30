import { BrowserWindow, ipcMain, shell } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log/main';
import type { UpdateStatus } from './ipc/contracts';

const SIX_HOURS_MS = 6 * 60 * 60 * 1000;
const STARTUP_DELAY_MS = 30_000;
const RELEASES_URL = 'https://github.com/monocircuit/vita/releases/latest';

let intervalHandle: NodeJS.Timeout | null = null;

export function initUpdater(mainWindow: BrowserWindow): void {
  log.initialize();
  log.transports.file.level = 'info';
  autoUpdater.logger = log;
  autoUpdater.autoDownload = true;

  if (process.platform === 'darwin') {
    // Unsigned macOS: Gatekeeper blocks auto-install. Toast links user to releases.
    autoUpdater.autoInstallOnAppQuit = false;
  }

  const emit = (status: UpdateStatus): void => {
    if (mainWindow.isDestroyed()) return;
    mainWindow.webContents.send('updater:status', status);
  };

  autoUpdater.on('checking-for-update', () => emit({ state: 'checking' }));
  autoUpdater.on('update-available', (info) =>
    emit({ state: 'available', version: info.version }),
  );
  autoUpdater.on('update-not-available', () => emit({ state: 'not-available' }));
  autoUpdater.on('download-progress', (progress) =>
    emit({ state: 'downloading', percent: Math.round(progress.percent) }),
  );
  autoUpdater.on('update-downloaded', (info) =>
    emit({ state: 'downloaded', version: info.version }),
  );
  autoUpdater.on('error', (err) => {
    log.error('Updater error', err);
    emit({ state: 'error', message: err.message });
  });

  ipcMain.handle('updater:check-now', async () => {
    await autoUpdater.checkForUpdates();
  });

  ipcMain.handle('updater:quit-and-install', async () => {
    autoUpdater.quitAndInstall();
  });

  ipcMain.handle('updater:open-releases-page', async () => {
    await shell.openExternal(RELEASES_URL);
  });

  setTimeout(() => {
    void autoUpdater.checkForUpdates();
  }, STARTUP_DELAY_MS);

  intervalHandle = setInterval(() => {
    void autoUpdater.checkForUpdates();
  }, SIX_HOURS_MS);

  mainWindow.on('closed', () => {
    if (intervalHandle) {
      clearInterval(intervalHandle);
      intervalHandle = null;
    }
  });
}
