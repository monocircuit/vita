import { contextBridge, ipcRenderer } from 'electron';
import type { Api } from './ipc/contracts';

const api: Api = {
  vitas: {
    list: () => ipcRenderer.invoke('vitas:list'),
    byId: (id) => ipcRenderer.invoke('vitas:byId', id),
    create: (input) => ipcRenderer.invoke('vitas:create', input),
    update: (id, patch) => ipcRenderer.invoke('vitas:update', id, patch),
    delete: (id) => ipcRenderer.invoke('vitas:delete', id),
  },
};

contextBridge.exposeInMainWorld('api', api);
