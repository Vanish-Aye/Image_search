import { createApp } from 'vue'
import ToastComponent from '@renderer/components/toastNotification.vue'

type ToastType = 'info' | 'success' | 'warning' | 'error'

interface ToastOptions {
  type?: ToastType
  duration?: number
}

interface ToastService {
  show(message: string, options?: ToastOptions | ToastType): void
  info(message: string, duration?: number): void
  success(message: string, duration?: number): void
  warning(message: string, duration?: number): void
  error(message: string, duration?: number): void
}

let toastInstance

// 创建挂载点并初始化 toast 实例
function ensureToastInstance() {
  if (!toastInstance) {
    const toastMountEl = document.createElement('div')
    document.body.appendChild(toastMountEl)
    toastInstance = createApp(ToastComponent).mount(toastMountEl)
  }
}

const toast: ToastService = {
  show(message: string, options: ToastOptions | ToastType = {}) {
    ensureToastInstance()

    let type: ToastType = 'info'
    let duration = 2000

    if (typeof options === 'string') {
      type = options
    } else {
      type = options.type || 'info'
      duration = options.duration || 2000
    }

    toastInstance?.show(message, type, duration)
  },
  info(message: string, duration: number = 2000) {
    this.show(message, { type: 'info', duration })
  },
  success(message: string, duration: number = 2000) {
    this.show(message, { type: 'success', duration })
  },
  warning(message: string, duration: number = 2000) {
    this.show(message, { type: 'warning', duration })
  },
  error(message: string, duration: number = 2000) {
    this.show(message, { type: 'error', duration })
  }
}

// 直接导出 toast 实例
export default toast
