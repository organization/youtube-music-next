import { createPluginBuilder } from '@/@types/plugin';

const builder = createPluginBuilder('lumiastream', {
  name: 'Lumia Stream [beta]',
  restartNeeded: true,
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
