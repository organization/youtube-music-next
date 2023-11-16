import { deepmerge } from 'deepmerge-ts';

import {
  BasePluginSettings,
  PluginContext,
  PluginDef,
  PreloadPluginContext,
} from '@/@types/plugin';
import config from '@/config';

const allPlugins: Record<string, PluginDef<string, BasePluginSettings>> = {};
const unregisterStyleMap: Record<string, (() => void)[]> = {};
const loadedPluginMap: Record<string, PreloadPluginContext> = {};

const createContext = <
  Key extends keyof PluginList,
  Settings extends BasePluginSettings = PluginList[Key]['settings'],
>(id: Key): PluginContext<Settings> => ({
  getSettings: () => deepmerge(allPlugins[id].settings, config.get(`plugins.${id}`) ?? {}) as Settings,
  setSettings: (newConfig) => {
    config.setPartial(`plugins.${id}`, newConfig);
  },
});

export const forceUnloadPreloadPlugin = (id: keyof PluginList) => {
  unregisterStyleMap[id]?.forEach((unregister) => unregister());
  delete unregisterStyleMap[id];

  loadedPluginMap[id]?.onUnload?.();
  delete loadedPluginMap[id];

  console.log('[YTMusic]', `"${id}" plugin is unloaded`);
};

export const forceLoadPreloadPlugin = async (id: keyof PluginList) => {
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

export const loadAllPreloadPlugins = async () => {
  const pluginConfigs = config.plugins.getPlugins();

  for (const [pluginId, builder] of Object.entries(allPluginBuilders)) {
    const typedBuilder = builder as PluginList[keyof PluginList];

    const config = deepmerge(typedBuilder.config, pluginConfigs[pluginId as keyof PluginList] ?? {});

    if (config.enabled) {
      await forceLoadPreloadPlugin(pluginId as keyof PluginList);
    } else {
      if (loadedPluginMap[pluginId as keyof PluginList]) {
        forceUnloadPreloadPlugin(pluginId as keyof PluginList);
      }
    }
  }
};

export const unloadAllPreloadPlugins = () => {
  for (const id of Object.keys(loadedPluginMap)) {
    forceUnloadPreloadPlugin(id as keyof PluginList);
  }
};

export const getLoadedPreloadPlugin = <Key extends keyof PluginList>(id: Key): PreloadPlugin<PluginList[Key]['config']> | undefined => {
  return loadedPluginMap[id];
};
export const getAllLoadedPreloadPlugins = () => {
  return loadedPluginMap;
};
export const registerPreloadPlugin = (
  id: string,
  builder: PluginDefinition<string, BasePluginSettings>,
  factory?: PreloadPluginFactory<BasePluginSettings>,
) => {
  if (factory) allPluginFactoryList[id] = factory;
  allPluginBuilders[id] = builder;
};
