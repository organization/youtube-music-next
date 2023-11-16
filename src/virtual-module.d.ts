declare module 'virtual:MainPlugins' {
  import type { PluginDef } from './@types/plugin';

  export const mainPlugins: Record<keyof PluginList, PluginDef>;
}

declare module 'virtual:MenuPlugins' {
  import type { PluginDef } from './@types/plugin';

  export const menuPlugins: Record<keyof PluginList, PluginDef>;
}

declare module 'virtual:PreloadPlugins' {
  import type { PluginDef } from './@types/plugin';

  export const preloadPlugins: Record<keyof PluginList, PluginDef>;
}

declare module 'virtual:RendererPlugins' {
  import type { PluginDef } from './@types/plugin';

  export const rendererPlugins: Record<keyof PluginList, PluginDef>;
}
