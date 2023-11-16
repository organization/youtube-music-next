import style from './style.css?inline';
import { createPlugin } from '@/@types/plugin';

const plugin = createPlugin( {
  id: 'blur-nav-bar',
  name: 'Blur Navigation Bar',
  description: '',

  restartNeeded: true,
  settings: {
    enabled: false,
  },
  stylesheets: [style],
});

export default plugin;

declare global {
  interface PluginList {
    [plugin.id]: typeof plugin;
  }
}
