import { Child_IpcChannels, OneWay_IpcChannels, Send_IpcChannels } from '@global/channeldef'
import { ipcMain, ipcRenderer, MessageChannelMain, MessagePortMain, utilityProcess, webContents } from 'electron'
import path from 'path'

type ExtractSuccessType<T> = T extends { msg: infer M }
  ? M extends { state: 'success' }
    ? T
    : never
  : never

/**
 * 模型推理进程管理
 */
export class Inference_Manger {
  public taskinfo: {
    inWorking: boolean
    numOfworks: number
    finished: number
  }
  protected inferProcesses: Map<
    string,
    { process: Electron.UtilityProcess; port: Electron.MessagePortMain | null }
  >
  protected mainProcess: Electron.MessagePortMain
  // -----------------------tool start---------------------
  protected postMessageToInferer<T extends keyof Send_IpcChannels>(
    port: Electron.MessagePortMain,
    msg: Send_IpcChannels[T]['toInfer']
  ) {
    // console.log(`${srcChannel} posted msg to inferer`)
    port.postMessage(msg)
  }
  protected postMessageToChild<T extends keyof Child_IpcChannels>(
    child: Electron.UtilityProcess,
    msg: Child_IpcChannels[T]['request'],
    transfer?: MessagePortMain[]
  ) {
    child.postMessage(msg, transfer)
  }

  protected ReplyRevent<T extends keyof Send_IpcChannels>(
    Revent: Electron.IpcMainEvent,
    channel: string,
    args: Send_IpcChannels[T]['response']['msg']
  ) {
    console.log(`reply to ${channel}`)
    Revent.reply(channel, args)
  }
  // 获取推理进程的 MessagePort 以建立通信
  getProcessPort(pname: string) {
    const process_Info = this.inferProcesses.get(pname)
    return process_Info ? process_Info.port : null
  }

  // 停止推理进程
  stopProcess(pname: string) {
    const process_Info = this.inferProcesses.get(pname)
    if (process_Info) {
      process_Info.process.kill()
      this.inferProcesses.delete(pname)
    }
  }

  // -----------------------tool end-----------------------
  // -----------------------internal start-----------------

  // 改进的类型守卫函数
  protected _inferEventOk<T extends keyof Send_IpcChannels>(
    eventName: T,
    data: Send_IpcChannels[T]['response']
  ): data is ExtractSuccessType<Send_IpcChannels[T]['response']> {
    return data.eventName == eventName && data.msg.state == 'success'
  }
  protected _inferEventOkOneWay<T extends keyof OneWay_IpcChannels>(
    eventName: T,
    data: OneWay_IpcChannels[T]['response']
  ): data is ExtractSuccessType<OneWay_IpcChannels[T]['response']> {
    console.log(data, 'eN:', eventName)
    return data.eventName == eventName && data.msg.state == 'success'
  }
  // -----------------------internal end-------------------

  constructor() {
    // 初始化
    this.mainProcess = null as unknown as Electron.MessagePortMain
    this.inferProcesses = new Map<
      string,
      { process: Electron.UtilityProcess; port: Electron.MessagePortMain | null }
    >()

    this.taskinfo = {
      inWorking: false,
      numOfworks: 0,
      finished: 0
    }
  }

  public startPluginUtilityProcess() {
    if (this.inferProcesses.get('main')) {
      console.warn('已经存在推理主程序了。')
      return
    }
    // 构建插件入口文件的绝对路径，通常需要指向打包后的资源路径
    const pluginEntryPath = path.join(__dirname, './imageInfer.js')
    console.log(pluginEntryPath)
    /**
     * 初始化通信端口，
     * 端口2可返回传递给node端主进程或web端渲染进程
     */
    const { port1, port2 } = new MessageChannelMain()

    try {
      const child = utilityProcess.fork(pluginEntryPath, [], {
        // 关键：配置 stdio，让子进程的 stdio 继承到父进程
        stdio: ['ignore', 'pipe', 'pipe']
      })

      // 添加 stdout 监听
      child.stdout?.on('data', (data) => {
        console.log(`[推理进程输出] ${data.toString().trim()}`)
      })

      child.stderr?.on('data', (data) => {
        console.error(`[推理进程错误] ${data.toString().trim()}`)
      })

      // 接收插件进程的完成启动
      child.once('message', (msg) => {
        if (msg == 'INFER_ONE_UTILITY_PROCESS_READY') {
          console.log(`model inference process is started!`)

          this.postMessageToChild(child, 'child-port-give', [port1])

        }
      })

      port2.once('message', (event) => {
        if (event.data.status == 'GetedPort') {
          console.log('infernce message pipe created successfully!')
        }
      })
      port2.start()
      this.mainProcess = port2

      child.on('exit', (code) => {
        console.log('EXITED with code:', code)
      })
      this.inferProcesses.set('main', {
        process: child,
        port: port2
      })
      return port2
    } catch (error) {
      console.log('Error:', error)
      return port2
    }
  }

  // 1.对图像提取特征
  startImgFeaExtract(imgPaths: string[], Revent: Electron.IpcMainEvent, processChannel: string) {
    if (this.taskinfo.inWorking == true) {
      console.log('模型正在工作中...')
    }
    this.taskinfo.inWorking = true
    this.taskinfo.numOfworks = imgPaths.length

    this.postMessageToInferer(this.mainProcess, {
      imgPaths: imgPaths,
      eventName: 'add-img-to-db'
    })
    this.ReplyRevent(Revent, processChannel, {
      isFinal: false,
      state: 'success',
      content: [0, 0]
    })

    const Progress_tracking = (messageEvent: {
      data: Send_IpcChannels['add-img-to-db']['response']
      ports: MessagePortMain[]
    }) => {
      // 判定事件类型
      if (this._inferEventOk('add-img-to-db', messageEvent.data)) {
        console.log('get sucess')
        this.taskinfo.finished += 1
        this.ReplyRevent(Revent, processChannel, {
          isFinal: false,
          state: 'success',
          content: [this.taskinfo.finished, this.taskinfo.numOfworks]
        })
        // 已完成
        if (this.taskinfo.finished == this.taskinfo.numOfworks) {
          // 数据重置
          this.taskinfo.inWorking = false
          this.taskinfo.finished = 0
          this.taskinfo.numOfworks = 0
          // 消息发送
          this.ReplyRevent(Revent, processChannel, {
            isFinal: true,
            state: 'success',
            content: [0, 0]
          })
          this.mainProcess.removeListener('message', Progress_tracking)
        }
      } else if (messageEvent.data.msg.state == 'error') {
        this.taskinfo.finished += 1
        console.error(messageEvent.data.msg.message)
      }
    }

    this.mainProcess.on('message', Progress_tracking)
  }

  // 2.获取数据库内图片列表
  getImgsForList(range: [number, number], Revent: Electron.IpcMainEvent, processChannel: string) {
    this.postMessageToInferer(this.mainProcess, {
      range: range,
      eventName: 'request-imgs-from-db'
    })
    const Progress_tracking = (messageEvent: {
      data: Send_IpcChannels['request-imgs-from-db']['response']
      ports: MessagePortMain[]
    }) => {
      // 判定事件类型
      if (this._inferEventOk('request-imgs-from-db', messageEvent.data)) {
        // 回复给渲染进程
        this.ReplyRevent(Revent, processChannel, {
          state: 'success',
          isFinal: true,
          content: messageEvent.data.msg.content
        })
        this.mainProcess.removeListener('message', Progress_tracking)
      }
    }

    this.mainProcess.on('message', Progress_tracking)
  }

  startTextSearch(text: string, Revent: Electron.IpcMainEvent, processChannel: string) {
    this.postMessageToInferer(this.mainProcess, {
      eventName: 'text-search',
      text: text
    })

    this.mainProcess.once(
      'message',
      (messageEvent: {
        data: Send_IpcChannels['text-search']['response']
        ports: MessagePortMain[]
      }) => {
        if (this._inferEventOk('text-search', messageEvent.data)) {
          this.ReplyRevent(Revent, processChannel, {
            state: 'success',
            content: messageEvent.data.msg.content
          })
        }
      }
    )
  }

  startRemovefdb(path: string, Revent: Electron.IpcMainEvent, processChannel: string) {
    this.postMessageToInferer(this.mainProcess, {
      path: path,
      eventName: 'remove-from-db'
    })
    this.mainProcess.once(
      'message',
      (messageEvent: {
        data: OneWay_IpcChannels['new-img-removed']['response']
        ports: MessagePortMain[]
      }) => {
        if (this._inferEventOkOneWay('new-img-removed', messageEvent.data)) {
          Revent.sender.send(processChannel, {
            state: 'success',
            content: messageEvent.data.msg.content
          })
          console.log('ok')
          Revent.sender.send('new-img-removed', {
            eventName: 'new-img-removed',
            msg: {
              state: 'success',
              content: messageEvent.data.msg.content
            }
          })
        }
      }
    )
  }
}
