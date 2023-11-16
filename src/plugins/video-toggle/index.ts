import forceHideStyle from './force-hide.css?inline';
import buttonSwitcherStyle from './button-switcher.css?inline';

import { createPluginBuilder } from '@/@types/plugin';

export type VideoTogglePluginConfig = {
  enabled: boolean;
  hideVideo: boolean;
  mode: 'custom' | 'native' | 'disabled';
  forceHide: boolean;
  align: 'left' | 'middle' | 'right';
}

const builder = createPluginBuilder('video-toggle', {
  name: 'Video Toggle',
  restartNeeded: true,
  config: {
    enabled: false,
    hideVideo: false,
    mode: 'custom',
    forceHide: false,
    align: 'left',
  } as VideoTogglePluginConfig,
  styles: [
    buttonSwitcherStyle,
    forceHideStyle,
  ],
});

export default builder;

declare global {
  interface PluginList {
    [builder.id]: typeof builder;
  }
}
