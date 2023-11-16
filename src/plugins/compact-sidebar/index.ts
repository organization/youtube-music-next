import { createPluginBuilder } from '@/@types/plugin';

const builder = createPluginBuilder('compact-sidebar', {
  name: 'Compact Sidebar',
  restartNeeded: false,
  config: {
    enabled: false,
  },
});

export default builder;

declare global {
  interface PluginList {
    [builder.id]: typeof builder;
  }
}
