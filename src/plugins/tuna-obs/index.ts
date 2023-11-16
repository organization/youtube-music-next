import { createPluginBuilder } from '@/@types/plugin';

const builder = createPluginBuilder('tuna-obs', {
  name: 'Tuna OBS',
  restartNeeded: true,
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
