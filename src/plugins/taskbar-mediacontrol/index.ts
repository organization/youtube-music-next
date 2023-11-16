import { createPluginBuilder } from '@/@types/plugin';

const builder = createPluginBuilder('taskbar-mediacontrol', {
  name: 'Taskbar Media Control',
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
