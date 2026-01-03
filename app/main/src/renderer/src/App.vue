<script setup lang="ts">
// import Versions from './components/Versions.vue'
import { computed, nextTick, onMounted, ref } from 'vue'
import generalBtn from './components/generalBtn.vue'
import imageMg from './components/imageMg.vue'
import { RecycleScroller } from 'vue-virtual-scroller'
import { CustomRCMenu } from './services/rightclick'
import { Model_Settings_Store, Render_Ref_Store } from './store/all_store'
import { storeToRefs } from 'pinia'
const modelSettingsStore = Model_Settings_Store()
const { imgModePath, txtModelPath } = storeToRefs(modelSettingsStore)
const mylist = ref<string[]>()
const isReady = ref<boolean>(false)
import toast from './services/toast'

const renderRefStore = Render_Ref_Store()
const { resultImgs } = storeToRefs(renderRefStore)
// 初始化并绑定事件
onMounted(() => {
  window.api.send('initialize-infer-process', {
    processChannel: 'rep-initialize-infer-process',
    settings: {
      imgModelPath: imgModePath.value,
      txtModelPath: txtModelPath.value
    }
  })
  window.api.on_receive('error-channel', false, (event, args) => {
    if (args.msg.state == 'error') {
      toast.error(`错误通道收到错误消息:${args.msg.message}`, 5000)
    }
  })
  // 获取图片列表
  window.api.send('request-imgs-from-db', {
    range: [0, 49],
    processChannel: 'rep-request-imgs-from-db'
  })
  window.api.on('request-imgs-from-db', 'rep-request-imgs-from-db', true, (event, args) => {
    if (args.state == 'success') {
      mylist.value = args.content
      isReady.value = true
      console.log(`获取的图片列表:${mylist.value}`)
    }
  })
  // 监听新增图片事件
  window.api.on_receive('new-img-added', false, async (event, args) => {
    if (args.msg.state == 'success') {
      console.log(mylist.value)
      mylist.value?.push(args.msg.content)
      // 2. 等待DOM更新
      await nextTick()

      // 3. 重新启用组件
      isReady.value = false
      await nextTick() // 确保组件已卸载
      isReady.value = true
    }
  })
  // 监听删除图片事件
  window.api.on_receive('new-img-removed', false, async (event, args) => {
    if (args.eventName == 'new-img-removed' && args.msg.state == 'success') {
      for (let i = mylist.value!.length - 1; i >= 0; i--) {
        if (mylist.value![i] === args.msg.content) {
          mylist.value!.splice(i, 1)
        }
      }

      // 2. 等待DOM更新
      await nextTick()

      // 3. 重新启用组件
      isReady.value = false
      await nextTick() // 确保组件已卸载
      isReady.value = true
    }
  })
})

const getImgUrl = (rawPath: string) => {
  if (!rawPath) {
    return ''
  }
  // 1. 将Windows反斜杠路径转换为URL可接受的正斜杠
  const pathWithSlash = rawPath.replace(/\\/g, '/')
  const encodedPath = encodeURI(pathWithSlash)
  // 3. 拼接自定义协议
  return `img://${encodedPath}`
}
const handleRightClick = (event: MouseEvent, path: string) => {
  event.preventDefault() // 阻止默认右键菜单
  // console.log('右键坐标:', event.clientX, event.clientY);
  // 自定义逻辑（例如显示自定义菜单）

  CustomRCMenu(
    event.clientX,
    event.clientY,
    new Map<string, Function>([
      [
        '搜索相关',
        () => {
          console.log('null sel')
        }
      ],
      [
        '仅从数据库移出',
        () => {
          window.api.send('remove-from-db', {
            path: path,
            processChannel: 'rep-remove-from-db'
          })
        }
      ],
      [
        '移出数据库删除此文件',
        () => {
          console.log('null sel')
        }
      ],
      [
        '图片信息',
        () => {
          console.log('null sel')
        }
      ],
      [
        '查看详细信息',
        () => {
          console.log('施工中...')
        }
      ],
      [
        '添加到当前播放列表',
        () => {
          console.log('null sel')
        }
      ]
    ])
  )
}

const curImg = computed(() => {
  const src = getImgUrl(renderRefStore.currentImgSrc)
  if (src == '') {
    return null
  } else {
    return src
  }
})
</script>

<template>
  <div id="all_background">
    <div class="left_field">
      <generalBtn class="left_f_title">图片列表</generalBtn>
      <RecycleScroller
        v-if="isReady"
        v-slot="{ item }"
        class="scroller"
        grid-items="2"
        :items="mylist"
        :item-size="200"
        :buffer="500"
        key-field="id"
      >
        <div class="user">
          <img
            :src="getImgUrl(item)"
            class="imgInList"
            @click="
              () => {
                renderRefStore.currentImgSrc = item
                console.log(`当前图片路径:${renderRefStore.currentImgSrc}`)
              }
            "
            @contextmenu.prevent="handleRightClick($event, item)"
          />
        </div>
      </RecycleScroller>
      <imageMg></imageMg>
    </div>
    <div class="main_field">
      <div class="select_field">
        <p>结果</p>
        <generalBtn
          v-for="item in resultImgs"
          :key="item"
          style="margin: 2px; width: 55px"
          :clicked="
            () => {
              renderRefStore.currentImgSrc = item
              console.log(`当前图片路径:${renderRefStore.currentImgSrc}`)
            }
          "
        >
          <img
            :src="getImgUrl(item)"
            class="imgInList"
            style="max-width: 100%; max-height: 100%; padding: 2px"
          />
        </generalBtn>
      </div>
      <div class="display_field">
        <img v-if="curImg" :src="curImg" alt="当前图片" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.scroller {
  min-height: 70%;
  height: 70%;
  width: 100%;

  .user {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 200px;
    width: 200px;
    margin: 5px;
    background-color: rgb(100, 100, 100);
    border-radius: 10px;

    .imgInList {
      width: 80%;
      aspect-ratio: 1;
    }
  }
}

.scroller::-webkit-scrollbar {
  width: 7px;
  height: 8px;
}

/* 滚动条轨道 */
.scroller::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

/* 滚动条滑块 */
.scroller::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.scroller::-webkit-scrollbar-thumb:hover {
  background: #555;
}

#all_background {
  background-color: gray;
  display: flex;
  height: 100%;
  width: 100vw; /* 使用视口宽度，防止滚动条影响 */
}

.left_field {
  display: flex;
  position: relative;
  height: 100%;
  width: 420px;
  background-color: rgb(56, 53, 65);
  flex-direction: column;
  align-items: center;
  flex-shrink: 0; /* 防止收缩 */
  border-right: #000000 2px solid;
}

.left_f_title {
  position: relative;
  display: flex;
  background-color: rgb(32, 28, 28);
  color: #95acb3;
  border-radius: 2px;
  height: 20px;
  width: 100%;
  justify-content: center;
  align-items: center;
}

.main_field {
  display: flex;
  position: relative;
  flex-grow: 1;
  height: 100%;
  background-color: rgb(200, 200, 200);
  flex-direction: row;

  .select_field {
    display: flex;
    height: 100%;
    width: 60px;
    flex-direction: column;
    align-items: center;
    padding-top: 10px;

    .outscroller {
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }

  .display_field {
    display: flex;
    position: relative;
    flex: 1;
    justify-content: center;
    align-items: center;
    background-color: rgb(24, 24, 24);
    padding: 10px;

    img {
      max-height: 100%;
      max-width: 100%;
    }
  }
}
</style>
