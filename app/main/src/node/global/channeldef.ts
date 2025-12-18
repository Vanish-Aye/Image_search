import { IImageMetadataRet } from './shared.js'

// ----------------------------定义invoke通道映射对象
const Invoke_IpcChannels_Map = {
  'read-audiovideo-files': {
    request: [] as string[],
    response: [] as IImageMetadataRet[]
  }
} as const

// 从映射对象推导出类型
export type Invoke_IpcChannels = {
  [K in keyof typeof Invoke_IpcChannels_Map]: {
    request: (typeof Invoke_IpcChannels_Map)[K]['request']
    // request: (typeof Invoke_IpcChannels_Map)[K]['request'] extends Array<infer U> ? U[] : never
    response: (typeof Invoke_IpcChannels_Map)[K]['response']
  }
}

export enum WindowState {
  MAXIMIZED = 'maximized',
  UNMAXIMIZED = 'unmaximized',
  MINIMIZED = 'minimized',
  UNFULLSCREEN = 'unfullscreened',
  FULLSCREEN = 'fullscreened'
}

// ----------------------------定义send通道映射对象
const Send_IpcChannels_Map = {
  'request-imgs-from-db': {
    request: [] as unknown as {
      range: [number, number]
      processChannel: string
    },
    toInfer: [] as unknown as {
      range: [number, number]
      eventName: 'request-imgs-from-db'
    },
    response: {} as unknown as {
      eventName: 'request-imgs-from-db'
      msg: DefaultRet<string[]>
    }
  },
  'add-img-to-db': {
    request: [] as unknown as {
      valid: string[]
      processChannel: string
    },
    toInfer: [] as unknown as {
      imgPaths: string[]
      eventName: 'add-img-to-db'
    },
    response: {} as {
      eventName: 'add-img-to-db'
      msg: DefaultRet<[number, number]> | DefaultRet<null>
    }
  },
  'text-search': {
    request: [] as unknown as {
      text: string
      processChannel: string
    },
    toInfer: [] as unknown as {
      text: string
      eventName: 'text-search'
    },
    response: {} as {
      eventName: 'text-search'
      msg: DefaultRet<string[]> | DefaultRet<null>
    }
  }
} as const

export type Send_IpcChannels = {
  [K in keyof typeof Send_IpcChannels_Map]: {
    request: (typeof Send_IpcChannels_Map)[K]['request']
    toInfer: (typeof Send_IpcChannels_Map)[K]['toInfer']
    response: (typeof Send_IpcChannels_Map)[K]['response']
  }
}

// ----------------------------定义send通道映射对象
const Child_IpcChannels_Map = {
  'child-port-give': {
    request: 'child-port-give',
    response: null
  }
} as const

export type Child_IpcChannels = {
  [K in keyof typeof Child_IpcChannels_Map]: {
    request: (typeof Child_IpcChannels_Map)[K]['request']
    response: (typeof Child_IpcChannels_Map)[K]['response']
  }
}
// ----------------------------定义receive通道映射对象

const Receive_IpcChannels_Map = {
  'new-img-added': {
    response: [] as unknown as {
      eventName: 'text-search'
      msg: DefaultRet<string[]>
    }
  }
} as const

export type Receive_IpcChannels = {
  [K in keyof typeof Receive_IpcChannels_Map]: {
    response: (typeof Receive_IpcChannels_Map)[K]['response']
  }
}

// 获取所有通道名称
export type AllInvokeChannels = keyof typeof Invoke_IpcChannels_Map
export type AllSendChannels = keyof typeof Send_IpcChannels_Map
export type AllChildChannels = keyof typeof Child_IpcChannels_Map
export type AllReceiveChannels = keyof typeof Receive_IpcChannels_Map

export const ALL_INVOKE_CHANNELS = Object.keys(Invoke_IpcChannels_Map) as AllInvokeChannels[]
export const ALL_SEND_CHANNELS = Object.keys(Send_IpcChannels_Map) as AllSendChannels[]
export const ALL_CHILD_CHANNELS = Object.keys(Child_IpcChannels_Map) as AllChildChannels[]
export const ALL_RECEIVE_CHANNELS = Object.keys(Receive_IpcChannels_Map) as AllReceiveChannels[]
/**
 * 频道汇总
 */
export interface ValidChannelsConfig {
  send: AllSendChannels[]
  invoke: AllInvokeChannels[]
}

// 定义允许通信的频道（白名单）
// 使用自动生成的频道列表
export const validChannels: ValidChannelsConfig = {
  send: ALL_SEND_CHANNELS,
  invoke: ALL_INVOKE_CHANNELS
}
