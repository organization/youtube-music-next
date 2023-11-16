import style from './style.css?inline';

import { createPluginBuilder } from '@/@types/plugin';

const builder = createPluginBuilder('album-color-theme', {
  name: 'Album Color Theme',
  restartNeeded: true,
  config: {
    enabled: false,
  },
  styles: [style],
});

export default builder;

declare global {
  interface PluginList {
    [builder.id]: typeof builder;
  }
}
