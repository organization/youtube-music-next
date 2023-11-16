import { createPluginBuilder } from '@/@types/plugin';

const builder = createPluginBuilder('exponential-volume', {
  name: 'Exponential Volume',
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
