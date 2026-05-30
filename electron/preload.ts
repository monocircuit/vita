import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron';
import type { Api, UpdateStatus } from './ipc/contracts';

const api: Api = {
  vitas: {
    list: () => ipcRenderer.invoke('vitas:list'),
    byId: (id) => ipcRenderer.invoke('vitas:byId', id),
    create: (input) => ipcRenderer.invoke('vitas:create', input),
    update: (id, patch) => ipcRenderer.invoke('vitas:update', id, patch),
    delete: (id) => ipcRenderer.invoke('vitas:delete', id),
  },
  chronicles: {
    list: () => ipcRenderer.invoke('chronicles:list'),
    byId: (id) => ipcRenderer.invoke('chronicles:byId', id),
    byVitaId: (vitaId) => ipcRenderer.invoke('chronicles:byVitaId', vitaId),
    create: (input) => ipcRenderer.invoke('chronicles:create', input),
    update: (id, patch) => ipcRenderer.invoke('chronicles:update', id, patch),
    delete: (id) => ipcRenderer.invoke('chronicles:delete', id),
  },
  entities: {
    list: () => ipcRenderer.invoke('entities:list'),
    byId: (id) => ipcRenderer.invoke('entities:byId', id),
    create: (input) => ipcRenderer.invoke('entities:create', input),
    update: (id, patch) => ipcRenderer.invoke('entities:update', id, patch),
    delete: (id) => ipcRenderer.invoke('entities:delete', id),
  },
  chronicleEntities: {
    list: () => ipcRenderer.invoke('chronicleEntities:list'),
    linkMany: (chronicleId, entityIds) =>
      ipcRenderer.invoke('chronicleEntities:linkMany', chronicleId, entityIds),
    unlink: (chronicleId, entityId) =>
      ipcRenderer.invoke('chronicleEntities:unlink', chronicleId, entityId),
    unlinkAllForChronicle: (chronicleId) =>
      ipcRenderer.invoke('chronicleEntities:unlinkAllForChronicle', chronicleId),
  },
  chronicleRelations: {
    listByChronicleId: (chronicleId) =>
      ipcRenderer.invoke('chronicleRelations:listByChronicleId', chronicleId),
    create: (input) => ipcRenderer.invoke('chronicleRelations:create', input),
    delete: (chronicleId, ancestor) =>
      ipcRenderer.invoke('chronicleRelations:delete', chronicleId, ancestor),
  },
  dynamicVitas: {
    list: () => ipcRenderer.invoke('dynamicVitas:list'),
    create: (input) => ipcRenderer.invoke('dynamicVitas:create', input),
    update: (id, patch) => ipcRenderer.invoke('dynamicVitas:update', id, patch),
    delete: (id) => ipcRenderer.invoke('dynamicVitas:delete', id),
  },
  dynamicVitaPaths: {
    listByDynamicVitaId: (dynamicVitaId) =>
      ipcRenderer.invoke('dynamicVitaPaths:listByDynamicVitaId', dynamicVitaId),
    upsert: (input) => ipcRenderer.invoke('dynamicVitaPaths:upsert', input),
    delete: (dynamicVitaId, chronicleId) =>
      ipcRenderer.invoke('dynamicVitaPaths:delete', dynamicVitaId, chronicleId),
  },
  shards: {
    byVitaId: (vitaId) => ipcRenderer.invoke('shards:byVitaId', vitaId),
    replaceForVita: (vitaId, shards) =>
      ipcRenderer.invoke('shards:replaceForVita', vitaId, shards),
  },
  addresses: {
    list: () => ipcRenderer.invoke('addresses:list'),
    create: (input) => ipcRenderer.invoke('addresses:create', input),
    update: (id, patch) => ipcRenderer.invoke('addresses:update', id, patch),
  },
  countries: {
    list: () => ipcRenderer.invoke('countries:list'),
  },
  continents: {
    list: () => ipcRenderer.invoke('continents:list'),
  },
  updater: {
    onStatus: (callback: (status: UpdateStatus) => void) => {
      const handler = (_event: IpcRendererEvent, status: UpdateStatus) => callback(status);
      ipcRenderer.on('updater:status', handler);
      return () => {
        ipcRenderer.removeListener('updater:status', handler);
      };
    },
    checkNow: () => ipcRenderer.invoke('updater:check-now'),
    quitAndInstall: () => ipcRenderer.invoke('updater:quit-and-install'),
    openReleasesPage: () => ipcRenderer.invoke('updater:open-releases-page'),
  },
};

contextBridge.exposeInMainWorld('api', api);
