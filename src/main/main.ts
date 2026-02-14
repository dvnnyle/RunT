import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { fork, ChildProcess } from 'child_process';

let mainWindow: BrowserWindow | null = null;
let canClose = false;
let serverProcess: ChildProcess | null = null;

const startLocalServer = (): boolean => {
  if (serverProcess) {
    return true;
  }

  try {
    const serverPath = path.join(app.getAppPath(), 'server', 'index.js');
    serverProcess = fork(serverPath, [], {
      stdio: 'pipe'
    });

    serverProcess.on('exit', () => {
      serverProcess = null;
    });

    return true;
  } catch (error) {
    console.error('Failed to start server:', error);
    serverProcess = null;
    return false;
  }
};

const stopLocalServer = (): boolean => {
  if (!serverProcess) {
    return false;
  }

  serverProcess.kill();
  serverProcess = null;
  return true;
};

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    fullscreen: true,
    autoHideMenuBar: true,
    frame: true,
    title: 'RunT | Dvnny.no',
    icon: path.join(__dirname, '../logo.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Remove menu bar completely
  mainWindow.setMenuBarVisibility(false);
  mainWindow.setMenu(null);

  // Intercept window close event - prevent closing unless authorized
  mainWindow.on('close', (event) => {
    if (!canClose) {
      event.preventDefault();
      // Optionally show a message or do nothing
      if (mainWindow && mainWindow.webContents) {
        mainWindow.webContents.executeJavaScript(
          `alert('This app can only be closed from Admin Settings')`
        );
      }
    }
  });

  // Load the renderer
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// IPC Handlers
ipcMain.handle('toggle-fullscreen', async () => {
  if (mainWindow) {
    const isFullscreen = mainWindow.isFullScreen();
    const newFullscreenState = !isFullscreen;
    mainWindow.setFullScreen(newFullscreenState);
    
    // Show menu bar when exiting fullscreen, hide when entering
    if (newFullscreenState) {
      mainWindow.setMenuBarVisibility(false);
    } else {
      mainWindow.setMenuBarVisibility(true);
      mainWindow.setMenu(null); // Keep it null but visible
    }
    
    return newFullscreenState;
  }
  return false;
});

ipcMain.handle('is-fullscreen', async () => {
  if (mainWindow) {
    return mainWindow.isFullScreen();
  }
  return false;
});

ipcMain.handle('quit-app', async () => {
  canClose = true;
  if (mainWindow) {
    mainWindow.close();
  }
  app.quit();
});

ipcMain.handle('start-server', async () => {
  return startLocalServer();
});

ipcMain.handle('stop-server', async () => {
  return stopLocalServer();
});

ipcMain.handle('server-status', async () => {
  return !!serverProcess;
});

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (serverProcess) {
    stopLocalServer();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
