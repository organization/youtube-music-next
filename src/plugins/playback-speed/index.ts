import { createPluginBuilder } from '@/@types/plugin';

const builder = createPluginBuilder('playback-speed', {
  name: 'Playback Speed',
  restartNeeded: false,
  config: {
    enabled: false,
  },
});

export default builder;

declare global {
  interface PluginBuilderList {
    [builder.id]: typeof builder;
  }
}
