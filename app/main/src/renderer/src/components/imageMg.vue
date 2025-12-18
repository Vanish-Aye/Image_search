<template>
  <div class="img_manager">
    <general-btn :clicked="opfs">添加图片至数据库</general-btn>
    <input-com width="100px" :handle-enter="text_search">搜索图片</input-com>
    <p>{{ taskState }}</p>
  </div>
</template>

<script setup lang="ts">
import generalBtn from './generalBtn.vue'
import { Valid_Image } from '@global/shared'
import inputCom from './inputCom.vue'
import { ref } from 'vue'
import { IpcRendererEvent } from 'electron'
const taskState = ref(`空闲`)

const opfs = async () => {
  window.api.send('add-img-to-db', {
    valid: Valid_Image,
    processChannel: 'test-addimg'
  })
  const processFunc = (event: IpcRendererEvent, taskinfo) => {
    taskState.value = `任务进行中${taskinfo[0]}/${taskinfo[1]}`
    if (taskinfo.isFinal) {
      window.api.removeListener('test-addimg', processFunc)
    }
  }
  window.api.on('add-img-to-db', 'test-addimg', false, processFunc)
}

const text_search = (event: KeyboardEvent) => {
  return 
}
</script>

<style lang="scss" scoped>
.img_manager {
  display: flex;
}
</style>
