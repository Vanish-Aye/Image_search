/* eslint-disable @typescript-eslint/no-explicit-any */
import { ElectronAPI } from '@electron-toolkit/preload'
import { Invoke_IpcChannels, Send_IpcChannels, Receive_IpcChannels } from '../global/channeldef'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      invoke: <T extends keyof Invoke_IpcChannels>(
        channel: T,
        args: Invoke_IpcChannels[T]['request']
      ) => Promise<Invoke_IpcChannels[T]['response']>

      send: <T extends keyof Send_IpcChannels>(
        channel: T,
        args: Send_IpcChannels[T]['request']
      ) => void

      /**
       * 监听Node端Send的回复事件
       * @param srcChannel 源频道（若无则是仅监听模式）
       * @param once 是否仅监听一次
       * @param channel 监听频道
       * @param listener 回调函数
       */
      on: <T extends keyof Send_IpcChannels>(
        srcChannel: T,
        channel: string,
        once: boolean,
        listener: (
          event: Electron.IpcRendererEvent,
          args: Send_IpcChannels[T]['response']['msg']
        ) => void
      ) => void

      /**
       * 监听Node端事件（无send过程）
       * @param srcChannel 源频道（若无则是仅监听模式）
       * @param once 是否仅监听一次
       * @param channel 监听频道
       * @param listener 回调函数
       */
      on_receive: <T extends keyof Receive_IpcChannels>(
        channel: T,
        once: boolean,
        listener: (
          event: Electron.IpcRendererEvent,
          args: Receive_IpcChannels[T]['response']
        ) => void
      ) => void

      removeListener: (
        channel: string,
        listener: (event: Electron.IpcRendererEvent, ...args: any[]) => void
      ) => void
    }
  }
  type ThemeName = 'day' | 'night'
}

export interface RightClickMenuPlusProps {
  [key: string]: unknown
  options: Map<string, Function>
  onClose: Function
}
