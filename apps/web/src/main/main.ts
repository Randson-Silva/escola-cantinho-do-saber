import { app, BrowserWindow } from 'electron';
import 'dotenv/config';

function createWindow() {
  const win = new BrowserWindow({
    width: 1366,
    height: 768,
    webPreferences: {
      allowRunningInsecureContent: true,
    },
  });

  const PORT = process.env.VITE_FRONT_PORT ?? 5173;

  const VITE_DEV_SERVER_URL = `http://localhost:${PORT}`;

  win.loadURL(VITE_DEV_SERVER_URL);

  win.webContents.openDevTools();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
