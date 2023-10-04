import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { _electron as electron } from 'playwright';
import { expect, test } from '@playwright/test';

process.env.NODE_ENV = 'test';

const appPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('YouTube Music App - With default settings, app is launched and visible', async () => {
  const app = await electron.launch({
    cwd: appPath,
    args: [
      appPath,
      '--no-sandbox',
      '--disable-gpu',
      '--whitelisted-ips=',
      '--disable-dev-shm-usage',
    ],
    env: {
      ELECTRON_ENABLE_LOGGING: true,
      ELECTRON_ENABLE_STACK_DUMPING: true,
      NODE_ENV: 'test',
    },
  });

  app.process().stdout.on('data', (data) => console.log(`stdout: ${data}`));
  app.process().stderr.on('data', (error) => console.log(`stderr: ${error}`));

  const window = await app.firstWindow();

  const consentForm = await window.$(
    "form[action='https://consent.youtube.com/save']",
  );
  if (consentForm) {
    await consentForm.click('button');
  }

  const title = await window.title();
  expect(title.replaceAll(/\s/g, ' ')).toEqual('YouTube Music');

  const url = window.url();
  expect(url.startsWith('https://music.youtube.com')).toBe(true);

  await app.close();
});
