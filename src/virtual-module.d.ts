declare module 'virtual:MainPlugins' {
  import type { PluginDef } from './@types/plugin';

  export const mainPlugins: Record<string, PluginDef>;
}

declare module 'virtual:MenuPlugins' {
  import type { PluginDef } from './@types/plugin';

  export const menuPlugins: Record<string, PluginDef>;
}

declare module 'virtual:PreloadPlugins' {
  import type { PluginDef } from './@types/plugin';

  export const preloadPlugins: Record<string, PluginDef>;
}

declare module 'virtual:RendererPlugins' {
  import type { PluginDef } from './@types/plugin';

  export const rendererPlugins: Record<string, PluginDef>;
}
