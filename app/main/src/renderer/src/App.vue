<script setup lang="ts">
// import Versions from './components/Versions.vue'
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import generalBtn from './components/generalBtn.vue'
import imageMg from './components/imageMg.vue'
import { RecycleScroller } from 'vue-virtual-scroller'
import { CustomRCMenu } from './services/rightclick'
const mylist = ref<string[]>()
// watch( () => mylist.value, () => { mylist.value =  } )
const isReady = ref<boolean>(false)

onMounted(() => {
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
</script>

<template>
  <div id="all_background">
    <div class="left_field">
      <generalBtn class="left_f_title"> title</generalBtn>
      <imageMg></imageMg>

      <RecycleScroller
        v-if="isReady"
        v-slot="{ item }"
        class="scroller"
        :items="mylist"
        :item-size="80"
        key-field="id"
      >
        <div class="user">
          <img
            :src="getImgUrl(item)"
            class="imgInList"
            @contextmenu.prevent="handleRightClick($event, item)"
          />
        </div>
      </RecycleScroller>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.scroller {
  height: 40%;
  width: 100%;

  .imgInList {
    height: 80px;
    aspect-ratio: 1;
  }
}

#all_background {
  background-color: gray;
  display: flex;
  height: 100%;
  width: 100%;
}

.left_field {
  display: flex;
  position: relative;
  height: 100%;
  width: 250px;
  background-color: rgb(59, 53, 65);
  flex-direction: column;
  align-items: center;
}

.left_f_title {
  position: relative;
  display: flex;
  height: 20px;
  justify-content: center;
  align-items: center;
}
</style>
