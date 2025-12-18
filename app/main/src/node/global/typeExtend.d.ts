// electron.d.ts 或 custom-electron.d.ts

import { Invoke_IpcChannels } from './channeldef'

declare namespace Electron {
  // 接口合并：扩展 'MessageEvent' 接口
  interface MessagePortMain {
    on(event: 'message', listener: (event: CustomMessageEvent) => void): this
  }
  class UtilityProcess {
    postMessage<T extends keyof Invoke_IpcChannels>(
      message: {
        event: T
        data: Invoke_IpcChannels[T]['response']
      },
      transfer?: Electron.MessagePortMain[]
    )
  }
}
