import { register } from 'electron-localshortcut';

import { BrowserWindow, Menu, MenuItem, ipcMain, nativeImage } from 'electron';

import builder from './';

export default builder.createMain(({ handle }) => {

  return {
    onLoad(win) {
      win.on('close', () => {
        win.webContents.send('close-all-in-app-menu-panel');
      });

      win.once('ready-to-show', () => {
        register(win, '`', () => {
          win.webContents.send('toggle-in-app-menu');
        });
      });

      handle(
        'get-menu',
        () => JSON.parse(JSON.stringify(
          Menu.getApplicationMenu(),
          (key: string, value: unknown) => (key !== 'commandsMap' && key !== 'menu') ? value : undefined),
        ),
      );

      const getMenuItemById = (commandId: number): MenuItem | null => {
        const menu = Menu.getApplicationMenu();

        let target: MenuItem | null = null;
        const stack = [...menu?.items ?? []];
        while (stack.length > 0) {
          const now = stack.shift();
          now?.submenu?.items.forEach((item) => stack.push(item));

          if (now?.commandId === commandId) {
            target = now;
            break;
          }
        }

        return target;
      };

      ipcMain.handle('menu-event', (event, commandId: number) => {
        const target = getMenuItemById(commandId);
        if (target) target.click(undefined, BrowserWindow.fromWebContents(event.sender), event.sender);
      });

      handle('get-menu-by-id', (_, commandId: number) => {
        const result = getMenuItemById(commandId);

        return JSON.parse(JSON.stringify(
          result,
          (key: string, value: unknown) => (key !== 'commandsMap' && key !== 'menu') ? value : undefined),
        );
      });

      handle('window-is-maximized', () => win.isMaximized());

      handle('window-close', () => win.close());
      handle('window-minimize', () => win.minimize());
      handle('window-maximize', () => win.maximize());
      win.on('maximize', () => win.webContents.send('window-maximize'));
      handle('window-unmaximize', () => win.unmaximize());
      win.on('unmaximize', () => win.webContents.send('window-unmaximize'));

      handle('image-path-to-data-url', (_, imagePath: string) => {
        const nativeImageIcon = nativeImage.createFromPath(imagePath);
        return nativeImageIcon?.toDataURL();
      });
    },
  };
});