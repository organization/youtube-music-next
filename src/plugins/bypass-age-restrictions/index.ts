import { createPluginBuilder } from '@/@types/plugin';

const builder = createPluginBuilder('bypass-age-restrictions', {
  name: 'Bypass Age Restrictions',
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
