<template>
  <div class="img_manager">
    <general-btn :clicked="opfs" width="10%">
      <img class="button" src="../assets/添加图片.png" />
    </general-btn>
    <input-com width="200px" :handle-enter="text_search" textcolor="rgb(0,0,0)">搜索图片</input-com>
    <input-com
      :ref="
        (el) => {
          searchNumbersCom = el
        }
      "
      width="3em"
      textcolor="rgb(0,0,0)"
      >数量</input-com
    >
    <p class="state">{{ taskState }}</p>
  </div>
</template>

<script setup lang="ts">
import generalBtn from './generalBtn.vue'
import { Valid_Image } from '@global/shared'
import inputCom from './inputCom.vue'
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { IpcRendererEvent } from 'electron'
import { Render_Ref_Store } from '@renderer/store/all_store'
const renderRefStore = Render_Ref_Store()
const { resultImgs, currentImgSrc } = storeToRefs(renderRefStore)
const taskState = ref(`空闲`)
const searchNumbersCom = ref()

const opfs = async () => {
  window.api.send('add-img-to-db', {
    valid: Valid_Image,
    processChannel: 'test-addimg'
  })
  const processFunc = (event: IpcRendererEvent, taskinfo) => {
    if (taskinfo.isFinal) {
      taskState.value = '空闲'
      window.api.removeListener('test-addimg', processFunc)
      return
    }
    taskState.value = `任务进行中${taskinfo.content[0]}/${taskinfo.content[1]}`
  }
  window.api.on('add-img-to-db', 'test-addimg', false, processFunc)
}

const text_search = (value: string) => {
  const num =
    searchNumbersCom.value.inputValue && searchNumbersCom.value.inputValue <= 20
      ? searchNumbersCom.value.inputValue
      : 1
  console.log(searchNumbersCom.value.inputValue)
  window.api.send('text-search', {
    text: value,
    numberOfResults: num,
    processChannel: 'rep-text-search'
  })
  window.api.on('text-search', 'rep-text-search', true, (event, args) => {
    console.log(`文本搜索结果:${args.content}`)
    resultImgs.value = args.content
    currentImgSrc.value = args.content[0]
  })
}
</script>

<style lang="scss" scoped>
.button {
  width: 40px;
  height: 40px;
}

.img_manager {
  display: flex;
  background-color: aliceblue;
  width: 100%;
  padding: 15px;
}

.state {
  position: absolute;
  width: 100%;
  background-color: rgba(24, 201, 255, 0.5);
  bottom: 0;
  left: 0;
}
</style>
