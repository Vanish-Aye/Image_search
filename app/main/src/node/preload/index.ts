/* eslint-disable @typescript-eslint/no-explicit-any */
import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import {
  validChannels,
  Invoke_IpcChannels,
  Send_IpcChannels,
  Receive_IpcChannels
} from '@global/channeldef.js'

// Custom APIs for renderer
const api = {
  invoke: <T extends keyof Invoke_IpcChannels>(
    channel: T,
    args: Invoke_IpcChannels[T]['request']
  ) => {
    if (validChannels.invoke.includes(channel)) {
      return ipcRenderer.invoke(channel, args)
    }
    return null
  },
  send: <T extends keyof Send_IpcChannels>(channel: T, processChannel: string) => {
    if (validChannels.send.includes(channel)) {
      ipcRenderer.send(channel, processChannel)
    }
  },
  on: <T extends keyof Send_IpcChannels>(
    srcChannel: T,
    channel: string,
    once: boolean,
    listener: (event: Electron.IpcRendererEvent, args: Send_IpcChannels[T]['response']) => void
  ) => {
    if (once) {
      console.log(`开始监听（单次）： ${channel}`)
      ipcRenderer.once(channel, listener)
    } else {
      console.log(`开始监听： ${channel}`)
      ipcRenderer.on(channel, listener)
    }
  },
  on_receive: <T extends keyof Receive_IpcChannels>(
    channel: T,
    once: boolean,
    listener: (event: Electron.IpcRendererEvent, args: Receive_IpcChannels[T]['response']) => void
  ) => {
    if (once) {
      console.log(`开始监听（单次）： ${channel}`)
      ipcRenderer.once(channel, listener)
    } else {
      console.log(`开始监听： ${channel}`)
      ipcRenderer.on(channel, listener)
    }
  },
  removeListener: (
    channel: string,
    listener: (event: Electron.IpcRendererEvent, ...args: any[]) => void
  ) => {
    ipcRenderer.removeListener(channel, listener)
  },
  log: (...args) => {
    ipcRenderer.send('main-log-event', args)
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
