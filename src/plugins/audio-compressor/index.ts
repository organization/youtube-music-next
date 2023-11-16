import { createPluginBuilder } from '@/@types/plugin';

const builder = createPluginBuilder('audio-compressor', {
  name: 'Audio Compressor',
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
