import { blockers } from './types';

import { createPlugin, createPluginBuilder } from '@/@types/plugin';
import { BrowserWindow } from 'electron';
import { isBlockerEnabled, loadAdBlockerEngine, unloadAdBlockerEngine } from '@/plugins/adblocker/blocker';
import injectCliqzPreload from '@/plugins/adblocker/injectors/inject-cliqz-preload';
import { inject, isInjected } from 'plugins/adblocker/injectors/inject';

interface AdblockerConfig {
  /**
   * Whether to enable the adblocker.
   * @default true
   */
  enabled: boolean;
  /**
   * When enabled, the adblocker will cache the blocklists.
   * @default true
   */
  cache: boolean;
  /**
   * Which adblocker to use.
   * @default blockers.InPlayer
   */
  blocker: typeof blockers[keyof typeof blockers];
  /**
   * Additional list of filters to use.
   * @example ["https://raw.githubusercontent.com/uBlockOrigin/uAssets/master/filters/filters.txt"]
   * @default []
   */
  additionalBlockLists: string[];
  /**
   * Disable the default blocklists.
   * @default false
   */
  disableDefaultLists: boolean;
}

const builder = createPlugin({
  id: 'adblocker',
  name: 'Adblocker',
  description: '',
  restartNeeded: false,
  settings: {
    enabled: true,
    cache: true,
    blocker: blockers.InPlayer,
    additionalBlockLists: [],
    disableDefaultLists: false,
  } as AdblockerConfig,
  menu: {
    getMenuItems: ({ getSettings, setSettings }) => {
      {
        const config = await getSettings();

        return [
          {
            label: 'Blocker',
            submenu: Object.values(blockers).map((blocker) => ({
              label: blocker,
              type: 'radio',
              checked: (config.blocker || blockers.WithBlocklists) === blocker,
              click() {
                setSettings({ blocker });
              },
            })),
          },
        ];
      }
    }
  };
  main: (() => {
    let mainWindow: BrowserWindow | undefined;

    return {
      async start({ getSettings, browserWindow }) {
        const config = await getSettings();
        mainWindow = browserWindow;

        if (config.blocker === blockers.WithBlocklists) {
          await loadAdBlockerEngine(
              browserWindow.webContents.session,
              config.cache,
              config.additionalBlockLists,
              config.disableDefaultLists,
          );
        }
      },
      stop({ browserWindow }) {
        if (isBlockerEnabled(browserWindow.webContents.session)) {
          unloadAdBlockerEngine(browserWindow.webContents.session);
        }
      },
      async onConfigChange(newConfig) {
        if (mainWindow) {
          if (newConfig.blocker === blockers.WithBlocklists && !isBlockerEnabled(mainWindow.webContents.session)) {
            await loadAdBlockerEngine(
                mainWindow.webContents.session,
                newConfig.cache,
                newConfig.additionalBlockLists,
                newConfig.disableDefaultLists,
            );
          }
        }
      }
    };
  })(),

  preload: {
    async start({ getSettings }) {
      const config = await getSettings();

      if (config.blocker === blockers.WithBlocklists) {
        // Preload adblocker to inject scripts/styles
        await injectCliqzPreload();
      } else if (config.blocker === blockers.InPlayer) {
        inject();
      }
    },
    async onConfigChange(newConfig) {
      if (newConfig.blocker === blockers.WithBlocklists) {
        await injectCliqzPreload();
      } else if (newConfig.blocker === blockers.InPlayer) {
        if (!isInjected()) {
          inject();
        }
      }
    }
  }
});

export default builder;

declare global {
  interface PluginList {
    [builder.id]: typeof builder;
  }
}
