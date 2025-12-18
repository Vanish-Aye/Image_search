import { App, createApp, nextTick } from 'vue'
import rightClickMenuPlus from '@renderer/components/rightClickMenuPlus.vue'
import type { RightClickMenuPlusProps } from 'src/node/webpreload'

export const CustomRCMenu = (x: number, y: number, arg: Map<string, Function>) => {
  let appInstance: App | null = null
  let menudiv: HTMLDivElement | null = null

  // 关闭菜单的函数
  const closeMenu = () => {
    if (appInstance && menudiv) {
      appInstance.unmount()
      document.body.removeChild(menudiv)
      document.removeEventListener('mousedown', handleOutsideClick)
      document.removeEventListener('scroll', closeMenu, true)
      window.removeEventListener('resize', closeMenu)
      appInstance = null
      menudiv = null
    }
  }

  // 点击外部关闭
  const handleOutsideClick = (event: MouseEvent) => {
    if (menudiv && !menudiv.contains(event.target as Node)) {
      closeMenu()
    }
  }

  // 创建菜单容器
  menudiv = document.createElement('div')
  menudiv.className = 'electron-custom-context-menu'
  document.body.appendChild(menudiv)

  // 创建应用实例并挂载
  appInstance = createApp(rightClickMenuPlus, {
    onClose: closeMenu,
    options: arg
  } as RightClickMenuPlusProps)

  appInstance.mount(menudiv)

  // 在下一个tick中计算位置（确保DOM已渲染）
  nextTick(() => {
    if (!menudiv) return

    // 获取菜单的实际尺寸
    const menuRect = menudiv.getBoundingClientRect()
    const menuWidth = menuRect.width
    const menuHeight = menuRect.height

    // 获取窗口尺寸
    const windowWidth = window.innerWidth
    const windowHeight = window.innerHeight

    // 计算调整后的位置
    let adjustedX = x
    let adjustedY = y

    // 水平边界检查（右侧超出）
    if (x + menuWidth > windowWidth) {
      adjustedX = windowWidth - menuWidth - 5 // 留一点边距
    }

    // 垂直边界检查（底部超出）
    if (y + menuHeight > windowHeight) {
      adjustedY = windowHeight - menuHeight - 5 // 留一点边距
    }

    // 确保不会调整到视口外（左侧和顶部）
    adjustedX = Math.max(5, adjustedX)
    adjustedY = Math.max(5, adjustedY)

    // 应用调整后的位置
    menudiv.style.position = 'fixed'
    menudiv.style.left = `${adjustedX}px`
    menudiv.style.top = `${adjustedY}px`
    menudiv.style.zIndex = '9999'

    // 添加动画类
    menudiv.classList.add('menu-visible')
  })

  // 监听事件
  document.addEventListener('mousedown', handleOutsideClick)
  // 添加滚动和窗口大小变化监听
  document.addEventListener('scroll', closeMenu, true)
  window.addEventListener('resize', closeMenu)

  if (menudiv) {
    menudiv.addEventListener('mousedown', (e) => e.stopPropagation())
  }

  return closeMenu // 返回关闭函数，方便外部控制
}
