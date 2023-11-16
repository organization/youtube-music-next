import { createPluginBuilder } from '@/@types/plugin';

const builder = createPluginBuilder('quality-changer', {
  name: 'Video Quality Changer',
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
