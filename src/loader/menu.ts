import { deepmerge } from 'deepmerge-ts';

import { MenuPluginContext, BasePluginSettings, PluginDef } from '@/@types/plugin';
import { setApplicationMenu } from '@/menu';
import config from '@/config';

import type { BrowserWindow, MenuItemConstructorOptions } from 'electron';

const allPlugins: Record<string, PluginDef<string, BasePluginSettings>> = {};
const menuTemplateMap: Record<string, MenuItemConstructorOptions[]> = {};

const createContext = <
  Key extends keyof PluginList,
  Settings extends BasePluginSettings = PluginList[Key]['settings'],
>(id: Key, win: BrowserWindow): MenuPluginContext<Settings> => ({
  getSettings: () => deepmerge(allPlugins[id].settings, config.get(`plugins.${id}`) ?? {}) as Settings,
  setSettings: (newConfig) => {
    config.setPartial(`plugins.${id}`, newConfig);
  },
  browserWindow: win,
  refresh: async () => {
    await setApplicationMenu(win);

    if (config.plugins.isEnabled('in-app-menu')) {
      win.webContents.send('refresh-in-app-menu');
    }
  },
});

export const forceLoadMenuPlugin = async (id: keyof PluginList, win: BrowserWindow) => {
  try {
    const pluginDef = allPlugins[id];
    if (!pluginDef) return;

    const context = createContext(id, win);
    const menuItem = await pluginDef.menu?.getMenuItems?.(context);
    if (menuItem) menuTemplateMap[id] = menuItem;

    console.log('[YTMusic]', `"${id}" plugin is loaded`);
  } catch (err) {
    console.log('[YTMusic]', `Cannot initialize "${id}" plugin: ${String(err)}`);
  }
};

export const loadAllMenuPlugins = async (win: BrowserWindow) => {
  const pluginConfigs = config.plugins.getPlugins();

  for (const [pluginId, pluginDef] of Object.entries(allPlugins)) {
    const config = deepmerge(pluginDef.settings, pluginConfigs[pluginId as keyof PluginList] ?? {}) as BasePluginSettings;

    if (config.enabled) {
      await forceLoadMenuPlugin(pluginId as keyof PluginList, win);
    }
  }
};

export const getMenuTemplate = <Key extends keyof PluginList>(id: Key): MenuItemConstructorOptions[] | undefined => {
  return menuTemplateMap[id];
};
export const getAllMenuTemplate = () => {
  return menuTemplateMap;
};
export const registerMenuPlugin = (
  id: string,
  builder: PluginDef<string, BasePluginSettings>,
) => {
  allPlugins[id] = builder;
};
