import prompt from 'custom-electron-prompt';

import { clear, connect, isConnected, registerRefresh } from './main';

import builder from './index';

import { setMenuOptions } from '@/config/plugins';
import promptOptions from '@/providers/prompt-options';
import { singleton } from '@/providers/decorators';

import type { MenuTemplate } from '@/menu';

const registerRefreshOnce = singleton((refreshMenu: () => void) => {
  registerRefresh(refreshMenu);
});

type DiscordOptions = ConfigType<'discord'>;

export default builder.createMenu(async ({ window, getConfig, setConfig, refresh }): Promise<MenuTemplate> => {
  const config = await getConfig();
  registerRefreshOnce(refresh);

  return [
    {
      label: isConnected() ? 'Connected' : 'Reconnect',
      enabled: !isConnected(),
      click: () => connect(),
    },
    {
      label: 'Auto reconnect',
      type: 'checkbox',
      checked: config.autoReconnect,
      click(item: Electron.MenuItem) {
        setConfig({
          autoReconnect: item.checked,
        });
      },
    },
    {
      label: 'Clear activity',
      click: clear,
    },
    {
      label: 'Clear activity after timeout',
      type: 'checkbox',
      checked: config.activityTimoutEnabled,
      click(item: Electron.MenuItem) {
        setConfig({
          activityTimoutEnabled: item.checked,
        });
      },
    },
    {
      label: 'Play on YouTube Music',
      type: 'checkbox',
      checked: config.playOnYouTubeMusic,
      click(item: Electron.MenuItem) {
        setConfig({
          playOnYouTubeMusic: item.checked,
        });
      },
    },
    {
      label: 'Hide GitHub link Button',
      type: 'checkbox',
      checked: config.hideGitHubButton,
      click(item: Electron.MenuItem) {
        setConfig({
          hideGitHubButton: item.checked,
        });
      },
    },
    {
      label: 'Hide duration left',
      type: 'checkbox',
      checked: config.hideDurationLeft,
      click(item: Electron.MenuItem) {
        setConfig({
          hideGitHubButton: item.checked,
        });
      },
    },
    {
      label: 'Set inactivity timeout',
      click: () => setInactivityTimeout(window, config),
    },
  ];
});

async function setInactivityTimeout(win: Electron.BrowserWindow, options: DiscordOptions) {
  const output = await prompt({
    title: 'Set Inactivity Timeout',
    label: 'Enter inactivity timeout in seconds:',
    value: String(Math.round((options.activityTimoutTime ?? 0) / 1e3)),
    type: 'counter',
    counterOptions: { minimum: 0, multiFire: true },
    width: 450,
    ...promptOptions(),
  }, win);

  if (output) {
    options.activityTimoutTime = Math.round(~~output * 1e3);
    setMenuOptions('discord', options);
  }
}
