import { defineStore } from 'pinia'
import { ref } from 'vue'

// 系统状态属性等
const Window_Store = defineStore(
  'windowstate',
  () => {
    const isFullScreen = ref(false)
    const showTitlebar = ref(true)
    const theme = ref<ThemeName>('day')

    return {
      isFullScreen,
      showTitlebar,
      theme
    }
  },
  {
    persist: {
      serializer: {
        serialize: (state) => {
          // 只序列化 theme 属性
          const serialized = {
            theme: state.theme
          }
          return JSON.stringify(serialized)
        },
        deserialize: (str) => {
          const data = JSON.parse(str)
          // 返回默认状态，但恢复持久化的 theme
          console.log(data)
          return {
            isFullScreen: false,
            showTitlebar: true,
            theme: data.theme || 'day' // 如果不存在则使用默认值
          }
        }
      }
    }
  }
)

export { Window_Store }
