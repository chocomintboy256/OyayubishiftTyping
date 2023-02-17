/**
 * This file is used specifically for security reasons.
 * Here you can access Nodejs stuff and inject functionality into
 * the renderer thread (accessible there through the "window" object)
 *
 * WARNING!
 * If you import anything from node_modules, then make sure that the package is specified
 * in package.json > dependencies and NOT in devDependencies
 *
 * Example (injects window.myAPI.doAThing() into renderer thread):
 *
 *   import { contextBridge } from 'electron'
 *
 *   contextBridge.exposeInMainWorld('myAPI', {
 *     doAThing: () => {}
 *   })
 *
 * WARNING!
 * If accessing Node functionality (like importing @electron/remote) then in your
 * electron-main.ts you will need to set the following when you instantiate BrowserWindow:
 *
 * mainWindow = new BrowserWindow({
 *   // ...
 *   webPreferences: {
 *     // ...
 *     sandbox: false // <-- to be able to import @electron/remote in preload script
 *   }
 * }
 */
import path from 'path';
import { app } from '@electron/remote';

import { contextBridge } from 'electron';
contextBridge.exposeInMainWorld('myAPI', {
  doAThing: () => {
    const fs = require('fs');
    const path =
      'C:/Prog/YamabukiR/layout/NICOLA拗音拡張＋α-半濁音をShiftで_custom.yab';
    // const data = fs.readFileSync(path, { encoding: 'utf8', flag: 'r' });
    const data = fs.readFileSync(path, { encoding: 'utf16le', flag: 'r' });
    return data;
  },
});
