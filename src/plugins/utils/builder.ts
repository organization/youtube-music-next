import type {
  BrowserWindow,
} from 'electron';

import type { YoutubePlayer } from '../../types/youtube-player';

type DeepPartial<T> = T extends object ? {
  [P in keyof T]?: DeepPartial<T[P]>;
} : T;
type MaybePromise<T> = T | Promise<T>;

export type BasePluginSettings = {
  enabled: boolean;
};
export type PluginContext<Settings extends BasePluginSettings = BasePluginSettings> = {
  getSettings: () => MaybePromise<Settings>;
  setSettings: (config: DeepPartial<Settings>) => MaybePromise<void>;
};

export type MainPluginContext<
  Settings extends BasePluginSettings,
> = PluginContext<Settings> & {
  send: <Arguments extends unknown[]>(event: string, ...args: Arguments) => void;
  handle: <Arguments extends unknown[], Return>(event: string, listener: (...args: Arguments) => MaybePromise<Return>) => void;
  on: <Arguments extends unknown[]>(event: string, listener: (...args: Arguments) => MaybePromise<void>) => void;
};
export type RendererPluginContext<Settings extends BasePluginSettings = BasePluginSettings> = PluginContext<Settings> & {
  invoke: <Return>(event: string, ...args: unknown[]) => Promise<Return>;
  on: <Arguments extends unknown[]>(event: string, listener: (...args: Arguments) => MaybePromise<void>) => void;
};
export type PreloadPluginContext<Settings extends BasePluginSettings = BasePluginSettings> = PluginContext<Settings>;
export type MenuPluginContext<Settings extends BasePluginSettings = BasePluginSettings> = PluginContext<Settings> & {
  window: BrowserWindow;

  refresh: () => void;
};

type BasePluginLifecycle<Context> = {
  start?(ctx: Context): MaybePromise<void>;
  stop?(ctx: Context): MaybePromise<void>;
};
type MainPluginLifecycle<Settings extends BasePluginSettings> = BasePluginLifecycle<MainPluginContext<Settings>>;
type PreloadPluginLifecycle<Settings extends BasePluginSettings> = BasePluginLifecycle<PreloadPluginContext<Settings>>;
type RendererPluginLifecycle<Settings extends BasePluginSettings> = BasePluginLifecycle<RendererPluginContext<Settings>> & {
  onPlayerApiReady?(api: YoutubePlayer): MaybePromise<void>;
};

type Author = string;

export interface PluginDef<
  ID extends string,
  Settings extends BasePluginSettings,
  MainProperties extends Record<string, unknown>,
  RendererProperties extends Record<string, unknown>,
> {
  id: ID;
  name: string;
  authors?: Author[];
  description: string;
  restartNeeded: boolean;
  menu?: Electron.MenuItemConstructorOptions[];

  settings: Settings;

  main?: {
    [key in keyof MainProperties]: MainProperties[key];
  } & MainPluginLifecycle<Settings>;
  preload?: PreloadPluginLifecycle<Settings>
  renderer?: {
    [key in keyof RendererProperties]: RendererProperties[key];
  } & RendererPluginLifecycle<Settings> & {
    stylesheets?: string[];
  };
}

export const createPlugin = <
  ID extends string,
  Settings extends BasePluginSettings,
  MainProperties extends Record<string, unknown>,
  RendererProperties extends Record<string, unknown>,
>(
  def: Omit<PluginDef<ID, Settings, MainProperties, RendererProperties>, 'settings'> & {
    settings?: Settings & { enabled: boolean };
  },
): PluginDef<ID, Settings, MainProperties, RendererProperties> => def as PluginDef<ID, Settings, MainProperties, RendererProperties>;
