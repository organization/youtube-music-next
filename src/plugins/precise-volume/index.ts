import hudStyle from './volume-hud.css?inline';

import { createPluginBuilder } from '@/@types/plugin';

export type PreciseVolumePluginConfig = {
  enabled: boolean;
  steps: number;
  arrowsShortcut: boolean;
  globalShortcuts: {
    volumeUp: string;
    volumeDown: string;
  };
  savedVolume: number | undefined;
};

const builder = createPluginBuilder('precise-volume', {
  name: 'Precise Volume',
  restartNeeded: true,
  config: {
    enabled: false,
    steps: 1, // Percentage of volume to change
    arrowsShortcut: true, // Enable ArrowUp + ArrowDown local shortcuts
    globalShortcuts: {
      volumeUp: '',
      volumeDown: '',
    },
    savedVolume: undefined, // Plugin save volume between session here
  } as PreciseVolumePluginConfig,
  styles: [hudStyle],
});

export default builder;

declare global {
  interface PluginList {
    [builder.id]: typeof builder;
  }
}
