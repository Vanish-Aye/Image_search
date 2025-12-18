import { Child_IpcChannels, Send_IpcChannels } from '@global/channeldef'
import { MessageChannelMain, MessagePortMain, utilityProcess } from 'electron'
import path from 'path'

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
    Revent.sender.send(channel, args)
  }

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

  public startPluginUtilityProcess(): boolean {
    if (this.inferProcesses.get('main')) {
      console.warn('已经存在推理主程序了。')
      return false
    }
    // 构建插件入口文件的绝对路径，通常需要指向打包后的资源路径
    const pluginEntryPath = path.join(__dirname, './imageInfer.js')
    console.log(pluginEntryPath)

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

      /**
       * 初始化通信端口，
       * 端口2可返回传递给node端主进程或web端渲染进程
       */
      const { port1, port2 } = new MessageChannelMain()

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
      return true
    } catch (error) {
      console.log('Error:', error)
      return false
    }
  }
  // 获取插件的 MessagePort 以建立通信
  getProcessPort(pname: string) {
    const process_Info = this.inferProcesses.get(pname)
    return process_Info ? process_Info.port : null
  }

  // 停止插件进程
  stopProcess(pname: string) {
    const process_Info = this.inferProcesses.get(pname)
    if (process_Info) {
      process_Info.process.kill()
      this.inferProcesses.delete(pname)
    }
  }

  // 对图像提取特征
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
      if (messageEvent.data.eventName == 'add-img-to-db') {
        if (messageEvent.data.msg.state == 'success') {
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
    }

    this.mainProcess.on('message', Progress_tracking)
  }

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
      if (messageEvent.data.eventName == 'request-imgs-from-db') {
        if (messageEvent.data.msg.state == 'success') {
          console.log(messageEvent.data.msg.content)
          this.ReplyRevent(Revent, processChannel, {
            state: 'success',
            isFinal: true,
            content: messageEvent.data.msg.content
          })
          this.mainProcess.removeListener('message', Progress_tracking)
        }
      }
    }

    this.mainProcess.on('message', Progress_tracking)
  }
}
