export enum ActivationEventType {
  // 应用生命周期事件
  ON_PORT_GIVEN = 'onPortGiven',
  ON_APP_STARTUP = 'onAppStartup',
  ON_APP_READY = 'onAppReady',
  ON_APP_SHUTDOWN = 'onAppShutdown',
  ON_IMG_GET_FEATURE = 'onImgGetFeature',
  ON_IMG_LIST_REQUEST = 'onImgListRequest'
}

// 处理接收通道
export const ActivationEventType_Map = {
  // 应用生命周期事件
  onPortGiven: {
    type: null as unknown as number
  },
  // 文件相关事件
  onFileOpened: {
    type: null as unknown as {
      filePath: string
    }
  },
  onFileSaved: {
    type: null as unknown as {
      filePath: string
    }
  },
  onFileClosed: {
    type: null as unknown as {
      filePath: string
    }
  },
  onImgGetFeature: {
    type: null as unknown as string[]
  },
  // 自定义事件（带命名空间）
  onCustomEvent: {
    type: null as unknown as {
      mydata: string
    }
  },
  onImgListRequest: {
    type: null as unknown as [number, number]
  }
} as const

import type { MessagePortMain } from 'electron'
export type ActivationEvent = {
  [K in keyof typeof ActivationEventType_Map]: {
    data: {
      eventName: K
      msg: (typeof ActivationEventType_Map)[K]['type']
    }
    ports?: MessagePortMain[]
  }
}[keyof typeof ActivationEventType_Map]
