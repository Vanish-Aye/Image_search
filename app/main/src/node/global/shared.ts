/**
 * 音频文件数据
 */
export interface IImageMetadata {
  buf: Buffer
  path: string
}

export interface IImageMetadataRet extends IImageMetadata {
  success: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error?: any
}

export enum GLOBAL_ERROR_CODE {
  // 图像载入数据库失败
  IMG_TO_DATABASE_FAILED = 0,
  //插件的自述文件格式不正确
  PLUGIN_DECLARATIO_FILE_IS_NOT_MATCHING = 1,
  //插件的自述文件格式不正确
  PLUGIN_INIT_FILE_IS_NOT_FOUND = 2
}

declare global {
  interface CustomMessageEvent {
    data: {
      status: 'success' | 'error'
      msg?: string
      taskId?: string
      progress?: number
    }
    ports?: Electron.MessagePortMain[] // 保留原有属性
  }
  type SUCCESS_RET<T> = {
    isFinal?: boolean
    state: 'success'
    content: T
  }

  type ERROR_RET = {
    state: 'error'
    isFinal?: boolean
    errorcode: GLOBAL_ERROR_CODE
    message: string
  }

  type DefaultRet<T> = SUCCESS_RET<T> | ERROR_RET
  function Formart_ERROR(ERROR: ERROR_RET): string
  /**
   * 自定义错误输出
   * @param ERROR
   */
  function Viuok_ERROR(ERROR: ERROR_RET): void
}

export function Formart_ERROR(error: ERROR_RET) {
  return `ErrorCode(${error.errorcode}):${error.message}`
}

export function Viuok_ERROR(error: ERROR_RET) {
  console.log(Formart_ERROR(error))
}

export const Valid_Image = ['jpg', 'jpeg', 'png', 'webp', 'avif', 'gif', 'svg', 'tiff']

// 运行期真正注入
globalThis.Formart_ERROR = Formart_ERROR
globalThis.Viuok_ERROR = Viuok_ERROR
