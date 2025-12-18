import { app, BrowserWindow, ipcMain, dialog, protocol, net } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { createWindow } from '../private/utils/window_option'
import { Inference_Manger } from './inference_mgr'
import { Send_IpcChannels } from '@global/channeldef'
import path from 'path'

class ipcMainOperater {
  private ipcMainC: Electron.IpcMain
  constructor(ipcm: Electron.IpcMain) {
    this.ipcMainC = ipcm
  }
  public on<T extends keyof Send_IpcChannels>(
    channel: T,
    listener: (event: Electron.IpcMainEvent, args: Send_IpcChannels[T]['request']) => void
  ) {
    this.ipcMainC.on(channel, listener)
  }
}

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'img', // 协议名称，可自定义
    privileges: {
      secure: true, // 安全
      standard: true,
      supportFetchAPI: true,
      corsEnabled: true // 允许跨域
    }
  }
])
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // 自定义本地图片访问协议
  protocol.handle('img', (request) => {
    const url = new URL(request.url)

    // 还原原始路径
    const drive = url.hostname // 比如 'z'
    let fullPath = decodeURIComponent(url.pathname) // /图片/1160162.png
    if (process.platform == 'win32') {
      fullPath = path.join(`${drive.toUpperCase()}:`, fullPath)
    }

    // 4. 使用 net.fetch 获取文件
    return net.fetch(fullPath).catch((error) => {
      console.error('加载文件失败:', fullPath, error)
      return new Response('Resource not found', { status: 404 })
    })
  })

  const mainWindow = createWindow()

  // 创建推理子程序
  const inferer_mgr = new Inference_Manger()
  inferer_mgr.startPluginUtilityProcess()

  // 创建自定义ipcMain控制对象
  const cipcMain = new ipcMainOperater(ipcMain)

  // 添加图像及其特征
  cipcMain.on('add-img-to-db', async (event, args) => {
    const options: Electron.OpenDialogOptions = {
      properties: ['multiSelections'], // 选择多个文件
      filters: [
        { name: 'Image', extensions: args.valid },
        { name: 'All Files', extensions: ['*'] }
      ]
    }
    const out = await dialog.showOpenDialog(mainWindow, options)
    console.log(out)
    inferer_mgr.startImgFeaExtract(out.filePaths, event, args.processChannel)
  })

  // 请求图片路径
  cipcMain.on('request-imgs-from-db', (event, args) => {
    inferer_mgr.getImgsForList(args.range, event, args.processChannel)
  })

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
