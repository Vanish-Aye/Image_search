<template>
  <div class="img_manager">
    <div class="search_option">
      <general-btn :clicked="opfs" width="15%">
        <img class="button" src="../assets/添加图片.png" />
      </general-btn>
      <input-com width="200px" :handle-enter="text_search" textcolor="rgb(0,0,0)"
        >搜索图片</input-com
      >
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
    </div>
    <div class="model_option">
      <general-btn width="33%" :clicked="changeImgModePath"> Img模型选择 </general-btn>
      <general-btn width="33%" :clicked="changeTxtModePath"> Txt模型选择 </general-btn>
    </div>
    <p class="state">{{ taskState }}</p>
  </div>
</template>

<script setup lang="ts">
import generalBtn from './generalBtn.vue'
import { Valid_Image } from '@global/shared'
import inputCom from './inputCom.vue'
import { nextTick, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { IpcRendererEvent } from 'electron'
import { Render_Ref_Store, Model_Settings_Store } from '@renderer/store/all_store'
const renderRefStore = Render_Ref_Store()
const { resultImgs, currentImgSrc } = storeToRefs(renderRefStore)
const modelSettingsStore = Model_Settings_Store()
const { imgModePath, txtModelPath } = storeToRefs(modelSettingsStore)
const taskState = ref(`空闲`)
const searchNumbersCom = ref()

// 添加图片到数据库
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

// 文本搜索图片
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
    resultImgs.value = args.content
    console.log(`文本搜索结果:${resultImgs.value}`)
    currentImgSrc.value = args.content[0]
    nextTick()
  })
}

const changeImgModePath = () => {
  window.api.send('change-model-path', {
    ValidModel: ['onnx'],
    ModelType: 'image',
    processChannel: 'rep-change-ImgModel-path'
  })
  window.api.on('change-model-path', 'rep-change-ImgModel-path', true, (event, args) => {
    if (args.content.type == 'image') {
      imgModePath.value = args.content.newModelPath
      console.log(`图像模型路径更改成功:${args.content}`)
    }
  })
}
const changeTxtModePath = () => {
  window.api.send('change-model-path', {
    ValidModel: ['onnx'],
    ModelType: 'text',
    processChannel: 'rep-change-TxtModel-path'
  })
  window.api.on('change-model-path', 'rep-change-TxtModel-path', true, (event, args) => {
    if (args.content.type == 'text') {
      txtModelPath.value = args.content.newModelPath
      console.log(`文本模型路径更改成功:${args.content}`)
    }
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
  background-color: rgb(156, 156, 156);
  width: 100%;
  padding: 15px;
  flex: 1;
  flex-direction: column;

  .model_option {
    display: flex;
    width: 100%;
    align-items: left;
  }

  .search_option {
    display: flex;
    width: 100%;
    align-items: center;
  }
}

.state {
  position: absolute;
  padding-left: 3px;
  width: 100%;
  background-color: rgba(24, 201, 255, 0.5);
  bottom: 0;
  left: 0;
}
</style>
