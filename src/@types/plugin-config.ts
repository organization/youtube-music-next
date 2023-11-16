export type PluginConfig<T extends keyof PluginList> = PluginList[T]['settings'];
