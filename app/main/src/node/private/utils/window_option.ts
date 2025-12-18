import { BrowserWindowConstructorOptions, BrowserWindow, shell } from 'electron'
import { is } from '@electron-toolkit/utils'
import { join } from 'path'
import icon from '../../../../resources/icon.png?asset'

export const WinOption: BrowserWindowConstructorOptions = {
  width: 900,
  height: 670,
  show: false,
  autoHideMenuBar: true,
  title: '图像查找',
  ...(process.platform === 'linux' ? { icon } : {}),
  webPreferences: {
    preload: join(__dirname, '../preload/index.js'),
    sandbox: false,
    contextIsolation: true
  }
}

export function createWindow(): BrowserWindow {
  const MainWindow = new BrowserWindow(WinOption)
  MainWindow.on('ready-to-show', () => {
    MainWindow.show()
  })

  MainWindow.webContents.setWindowOpenHandler((detils) => {
    shell.openExternal(detils.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    console.log('development env!')
    MainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    // 开发环境下设置窗口置顶
    MainWindow.setAlwaysOnTop(true, 'normal') // 第二个参数是层级类型
  } else {
    console.log('released env!')
    MainWindow.loadFile(join(__dirname, '../../renderer/index.html'))
  }
  return MainWindow
}
