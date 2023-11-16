import { BrowserWindow, ipcMain } from 'electron';

import { deepmerge } from 'deepmerge-ts';

import { injectCSS } from '@/plugins/utils/main';
import {
  MainPluginContext,
  BasePluginSettings, PluginDef,
} from '@/@types/plugin';

import config from '../config';

const allPlugins: Record<string, PluginDef<string, BasePluginSettings>> = {};
const unregisterStyleMap: Record<string, (() => void)[]> = {};
const loadedPluginMap: Record<string, PluginDef<string, BasePluginSettings>> = {};
const loadedContextMap: Record<string, MainPluginContext<BasePluginSettings>> = {};

const createContext = <
  Key extends keyof PluginList,
  Settings extends BasePluginSettings = PluginList[Key]['settings'],
>(id: Key, win: BrowserWindow): MainPluginContext<Settings> => ({
  getSettings: () => deepmerge(allPlugins[id].settings, config.get(`plugins.${id}`) ?? {}) as Settings,
  setSettings: (newConfig) => {
    config.setPartial(`plugins.${id}`, newConfig);
  },

  send: (event: string, ...args: unknown[]) => {
    win.webContents.send(event, ...args);
  },
  handle: (event: string, listener) => {
    ipcMain.handle(event, async (_, ...args) => listener(...args as never));
  },
  on: (event: string, listener) => {
    ipcMain.on(event, async (_, ...args) => listener(...args as never));
  },
  browserWindow: win,
});

export const forceUnloadMainPlugin = (id: keyof PluginList) => {
  unregisterStyleMap[id]?.forEach((unregister) => unregister());
  delete unregisterStyleMap[id];

  if (Object.hasOwn(loadedContextMap, id)) {
    loadedPluginMap[id]?.main?.stop?.(loadedContextMap[id]);
    delete loadedContextMap[id];
  }
  delete loadedPluginMap[id];

  console.log('[YTMusic]', `"${id}" plugin is unloaded`);
};

export const forceLoadMainPlugin = async (id: keyof PluginList, win: BrowserWindow) => {
  const builder = allPlugins[id];

  Promise.allSettled(
    builder.stylesheets?.map(async (style) => {
      const unregister = await injectCSS(win.webContents, style);
      console.log('[YTMusic]', `Injected CSS for "${id}" plugin`);

      return unregister;
    }) ?? [],
  ).then((result) => {
    unregisterStyleMap[id] = result
      .map((it) => it.status === 'fulfilled' && it.value)
      .filter(Boolean);

    let isInjectSuccess = true;
    result.forEach((it) => {
      if (it.status === 'rejected') {
        isInjectSuccess = false;

        console.log('[YTMusic]', `Cannot inject "${id}" plugin style: ${String(it.reason)}`);
      }
    });
    if (isInjectSuccess) console.log('[YTMusic]', `"${id}" plugin data is loaded`);
  });

  try {
    const context = createContext(id, win);
    loadedContextMap[id] = context;
    await allPlugins[id]?.main?.start?.(context);
    console.log('[YTMusic]', `"${id}" plugin is loaded`);
  } catch (err) {
    console.log('[YTMusic]', `Cannot initialize "${id}" plugin: ${String(err)}`);
  }
};

export const loadAllMainPlugins = async (win: BrowserWindow) => {
  const pluginConfigs = config.plugins.getPlugins();

  for (const [pluginId, pluginDef] of Object.entries(allPlugins)) {
    const config = deepmerge(pluginDef.settings, pluginConfigs[pluginId] ?? {}) as BasePluginSettings;

    if (config.enabled) {
      await forceLoadMainPlugin(pluginId as keyof PluginList, win);
    } else {
      if (loadedPluginMap[pluginId as keyof PluginList]) {
        forceUnloadMainPlugin(pluginId as keyof PluginList);
      }
    }
  }
};

export const unloadAllMainPlugins = () => {
  for (const id of Object.keys(loadedPluginMap)) {
    forceUnloadMainPlugin(id as keyof PluginList);
  }
};

export const getLoadedMainPlugin = <Key extends keyof PluginList>(id: Key) => {
  return loadedPluginMap[id];
};
export const getAllLoadedMainPlugins = () => {
  return loadedPluginMap;
};
export const registerMainPlugin = (
  id: string,
  pluginDef: PluginDef<string, BasePluginSettings>,
) => {
  allPlugins[id] = pluginDef;
};
