import { useSyncExternalStore } from 'react';
import type { UpdateStatus } from '../../../electron/ipc/contracts';

let cachedStatus: UpdateStatus = { state: 'idle' };
const listeners = new Set<() => void>();
let initialized = false;

function ensureSubscribed(): void {
  if (initialized) return;
  if (typeof window === 'undefined' || !window.api?.updater) return;
  initialized = true;
  window.api.updater.onStatus((status) => {
    cachedStatus = status;
    for (const listener of listeners) listener();
  });
}

export function useUpdater(): {
  status: UpdateStatus;
  checkNow: () => Promise<void>;
  quitAndInstall: () => Promise<void>;
  openReleasesPage: () => Promise<void>;
} {
  ensureSubscribed();

  const status = useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    () => cachedStatus,
    () => cachedStatus,
  );

  return {
    status,
    checkNow: () =>
      window.api?.updater
        ? window.api.updater.checkNow()
        : Promise.resolve(),
    quitAndInstall: () =>
      window.api?.updater
        ? window.api.updater.quitAndInstall()
        : Promise.resolve(),
    openReleasesPage: () =>
      window.api?.updater
        ? window.api.updater.openReleasesPage()
        : Promise.resolve(),
  };
}
