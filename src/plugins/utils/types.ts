import type { IpcMain, IpcRenderer, BrowserWindow } from 'electron';

export type PluginConfig<T extends keyof PluginBuilderList> = PluginBuilderList[T]['config'];

export interface BackendContext {
  ipc: {
    handle: IpcMain['handle'];
    on: IpcMain['on'];
  };

  browserWindow: BrowserWindow;
}

export interface PreloadContext {
  ipc: {
    invoke: IpcRenderer['invoke'];
    on: IpcRenderer['on'];
  };
}

export interface RendererContext {
  ipc: {
    invoke: IpcRenderer['invoke'];
    on: IpcRenderer['on'];
  };
}
