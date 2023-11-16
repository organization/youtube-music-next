import style from './style.css?inline';

import { createPluginBuilder } from '@/@types/plugin';

const builder = createPluginBuilder('blur-nav-bar', {
  name: 'Blur Navigation Bar',
  restartNeeded: true,
  config: {
    enabled: false,
  },
  styles: [style],
});

export default builder;

declare global {
  interface PluginBuilderList {
    [builder.id]: typeof builder;
  }
}
