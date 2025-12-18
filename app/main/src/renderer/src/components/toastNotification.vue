<template>
  <transition name="fade">
    <div
      v-if="visible"
      class="toast-notification"
      :class="type"
      @click="hide"
    >
      <span>{{ message }}</span>
    </div>
  </transition>
</template>
  
<script setup lang="ts">
import { ref } from 'vue'

type ToastType = 'info' | 'success' | 'warning' | 'error'

const visible = ref(false)
const message = ref('')
const type = ref<ToastType>('info')
let timeoutId: ReturnType<typeof setTimeout> | null = null

const show = (msg: string, toastType: ToastType = 'info', duration: number = 2000) => {
  // 清除之前的定时器
  if (timeoutId) {
    clearTimeout(timeoutId)
    timeoutId = null
  }

  message.value = msg
  type.value = toastType
  visible.value = true

  timeoutId = setTimeout(() => {
    hide()
  }, duration)
}

const hide = () => {
  visible.value = false
  if (timeoutId) {
    clearTimeout(timeoutId)
    timeoutId = null
  }
}

// 使用 defineExpose 暴露方法给父组件
defineExpose({
  show,
  hide
})
</script>

<style scoped>
/* 样式保持不变 */
.toast-notification {
    position: fixed;
    top: 3vh;
    right: 0px;
    padding: 12px 24px;
    border-radius: 4px;
    color: white;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 9999;
    max-width: 300px;
    animation: slideIn 0.3s ease-out;
}

.toast-notification.info {
    background-color: #1890ff;
}

.toast-notification.success {
    background-color: #52c41a;
}

.toast-notification.warning {
    background-color: #faad14;
}

.toast-notification.error {
    background-color: #f5222d;
}

.fade-enter-active, .fade-leave-active {
    transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to {
    opacity: 0;
}

@keyframes slideIn {
    from {
        transform: translateX(100%);
    }
    to {
        transform: translateX(0);
    }
}
</style>