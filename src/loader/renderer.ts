import { deepmerge } from 'deepmerge-ts';

import {
  BasePluginSettings, PluginDefinition,
  RendererPlugin,
  RendererPluginContext,
  RendererPluginFactory
} from '../@types/plugin';

const allPluginFactoryList: Record<string, RendererPluginFactory<BasePluginSettings>> = {};
const allPluginBuilders: Record<string, PluginDefinition<string, BasePluginSettings>> = {};
const unregisterStyleMap: Record<string, (() => void)[]> = {};
const loadedPluginMap: Record<string, RendererPlugin<BasePluginSettings>> = {};

const createContext = <
  Key extends keyof PluginList,
  Config extends BasePluginSettings = PluginList[Key]['config'],
>(id: Key): RendererPluginContext<Config> => ({
  getConfig: async () => {
    return await window.ipcRenderer.invoke('get-config', id) as Config;
  },
  setConfig: async (newConfig) => {
    await window.ipcRenderer.invoke('set-config', id, newConfig);
  },

  invoke: async <Return>(event: string, ...args: unknown[]): Promise<Return> => {
    return await window.ipcRenderer.invoke(event, ...args) as Return;
  },
  on: (event: string, listener) => {
    window.ipcRenderer.on(event, async (_, ...args) => listener(...args as never));
  },
});

export const forceUnloadRendererPlugin = (id: keyof PluginList) => {
  unregisterStyleMap[id]?.forEach((unregister) => unregister());
  delete unregisterStyleMap[id];

  loadedPluginMap[id]?.onUnload?.();
  delete loadedPluginMap[id];

  console.log('[YTMusic]', `"${id}" plugin is unloaded`);
};

export const forceLoadRendererPlugin = async (id: keyof PluginList) => {
  try {
    const factory = allPluginFactoryList[id];
    if (!factory) return;

    const context = createContext(id);
    const plugin = await factory(context);
    loadedPluginMap[id] = plugin;
    plugin.onLoad?.();

    console.log('[YTMusic]', `"${id}" plugin is loaded`);
  } catch (err) {
    console.log('[YTMusic]', `Cannot initialize "${id}" plugin: ${String(err)}`);
  }
};

export const loadAllRendererPlugins = async () => {
  const pluginConfigs = window.mainConfig.plugins.getPlugins();

  for (const [pluginId, builder] of Object.entries(allPluginBuilders)) {
    const typedBuilder = builder as PluginList[keyof PluginList];

    const config = deepmerge(typedBuilder.config, pluginConfigs[pluginId as keyof PluginList] ?? {});

    if (config.enabled) {
      await forceLoadRendererPlugin(pluginId as keyof PluginList);
    } else {
      if (loadedPluginMap[pluginId as keyof PluginList]) {
        forceUnloadRendererPlugin(pluginId as keyof PluginList);
      }
    }
  }
};

export const unloadAllRendererPlugins = () => {
  for (const id of Object.keys(loadedPluginMap)) {
    forceUnloadRendererPlugin(id as keyof PluginList);
  }
};

export const getLoadedRendererPlugin = <Key extends keyof PluginList>(id: Key): RendererPlugin<PluginList[Key]['config']> | undefined => {
  return loadedPluginMap[id];
};
export const getAllLoadedRendererPlugins = () => {
  return loadedPluginMap;
};
export const registerRendererPlugin = (
  id: string,
  builder: PluginDefinition<string, BasePluginSettings>,
  factory?: RendererPluginFactory<BasePluginSettings>,
) => {
  if (factory) allPluginFactoryList[id] = factory;
  allPluginBuilders[id] = builder;
};
