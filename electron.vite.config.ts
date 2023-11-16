import path from 'node:path';

import { defineConfig, defineViteConfig } from 'electron-vite';
import builtinModules from 'builtin-modules';
import viteResolve from 'vite-plugin-resolve';

import { pluginVirtualModuleGenerator } from './vite-plugins/plugin-importer';
import pluginLoader from './vite-plugins/plugin-loader';

import type { UserConfig } from 'vite';

const resolveAlias = {
  '@': path.join(__dirname, './src'),
  '@assets': path.join(__dirname, './assets'),
};

export default defineConfig({
  main: defineViteConfig(({ mode }) => {
    const commonConfig: UserConfig = {
      plugins: [
        pluginLoader('main'),
        viteResolve({
          'virtual:MainPlugins': pluginVirtualModuleGenerator('main'),
          'virtual:MenuPlugins': pluginVirtualModuleGenerator('menu'),
        }),
      ],
      publicDir: 'assets',
      build: {
        lib: {
          entry: 'src/index.ts',
          formats: ['cjs'],
        },
        outDir: 'dist/main',
        commonjsOptions: {
          ignoreDynamicRequires: true,
        },
        rollupOptions: {
          external: ['electron', 'custom-electron-prompt', ...builtinModules],
          input: './src/index.ts',
        },
      },
      resolve: {
        alias: resolveAlias,
      },
    };

    if (mode === 'development') {
      return commonConfig;
    }

    return {
      ...commonConfig,
      build: {
        ...commonConfig.build,
        minify: true,
        cssMinify: true,
      },
    };
  }),
  preload: defineViteConfig(({ mode }) => {
    const commonConfig: UserConfig = {
      plugins: [
        pluginLoader('preload'),
        viteResolve({
          'virtual:PreloadPlugins': pluginVirtualModuleGenerator('preload'),
        }),
      ],
      build: {
        lib: {
          entry: 'src/preload.ts',
          formats: ['cjs'],
        },
        outDir: 'dist/preload',
        commonjsOptions: {
          ignoreDynamicRequires: true,
        },
        rollupOptions: {
          external: ['electron', 'custom-electron-prompt', ...builtinModules],
          input: './src/preload.ts',
        }
      },
      resolve: {
        alias: resolveAlias,
      }
    };

    if (mode === 'development') {
      return commonConfig;
    }

    return {
      ...commonConfig,
      build: {
        ...commonConfig.build,
        minify: true,
        cssMinify: true,
      },
    };
  }),
  renderer: defineViteConfig(({ mode }) => {
    const commonConfig: UserConfig = {
      plugins: [
        pluginLoader('renderer'),
        viteResolve({
          'virtual:RendererPlugins': pluginVirtualModuleGenerator('renderer'),
        }),
      ],
      root: './src/',
      build: {
        lib: {
          entry: 'src/index.html',
          formats: ['iife'],
          name: 'renderer',
        },
        outDir: 'dist/renderer',
        commonjsOptions: {
          ignoreDynamicRequires: true,
        },
        rollupOptions: {
          external: ['electron', ...builtinModules],
          input: './src/index.html',
        },
      },
      resolve: {
        alias: resolveAlias,
      }
    };

    if (mode === 'development') {
      return commonConfig;
    }

    return {
      ...commonConfig,
      build: {
        ...commonConfig.build,
        minify: true,
        cssMinify: true,
      },
    };
  }),
});
