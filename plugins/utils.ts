import fs from 'node:fs';
import path from 'node:path';

import is from 'electron-is';

import { app } from 'electron';

import defaultConfig from '../config/defaults';

export const getAssetsDirectoryLocation = () => path.resolve(__dirname, 'assets');

export const getMediaIconLocation = () =>
  app.isPackaged
    ? path.resolve(app.getPath('userData'), 'icons')
    : path.resolve(getAssetsDirectoryLocation(), 'media-icons-black');

export const fileExists = (
  path: fs.PathLike,
  callbackIfExists: { (): void; (): void; (): void; },
  callbackIfError: (() => void) | undefined = undefined,
) => {
  fs.access(path, fs.constants.F_OK, (error) => {
    if (error) {
      callbackIfError?.();

      return;
    }

    callbackIfExists();
  });
};

const cssToInject = new Map<string, (() => void) | undefined>();
const cssToInjectFile = new Map<string, (() => void) | undefined>();
export const injectCSS = (webContents: Electron.WebContents, css: string, cb: (() => void) | undefined = undefined) => {
  if (cssToInject.size === 0 && cssToInjectFile.size === 0) {
    setupCssInjection(webContents);
  }

  cssToInject.set(css, cb);
};

export const injectCSSAsFile = (webContents: Electron.WebContents, filepath: string, cb: (() => void) | undefined = undefined) => {
  if (cssToInject.size === 0 && cssToInjectFile.size === 0) {
    setupCssInjection(webContents);
  }

  cssToInjectFile.set(filepath, cb);
};

const setupCssInjection = (webContents: Electron.WebContents) => {
  webContents.on('did-finish-load', () => {
    cssToInject.forEach(async (callback, css) => {
      await webContents.insertCSS(css);
      callback?.();
    });

    cssToInjectFile.forEach(async (callback, filepath) => {
      await webContents.insertCSS(fs.readFileSync(filepath, 'utf8'));
      callback?.();
    });
  });
};

export const getAvailablePluginNames = () => {
  return Object.keys(defaultConfig.plugins).filter((name) => {
    if (is.windows() && name === 'touchbar') {
      return false;
    } else if (is.macOS() && name === 'taskbar-mediacontrol') {
      return false;
    } else if (is.linux() && (name === 'taskbar-mediacontrol' || name === 'touchbar')) {
      return false;
    }
    return true;
  });
};
