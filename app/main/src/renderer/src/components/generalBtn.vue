<template>
  <label
    :style="cssVars"
    class="genbtn"
    :class="{ 'real-active': isActive }"
    @click="handleClick"
    @mousedown="handleMouseDown"
    @mouseup="handleMouseUp"
    @mouseleave="handleMouseUp"
  >
    <slot>img</slot>
  </label>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const Fprops = defineProps({
  clicked: {
    type: Function,
    default: () => {
      console.log('Default function is used.')
    }
  },
  width: {
    type: String,
    default: '50%',
    required: false
  }
})

const isActive = ref(false)

const handleClick = () => {
  Fprops.clicked()
}

const handleMouseDown = (e) => {
  if (e.button === 0) {
    // 左键
    isActive.value = true
  }
}

const handleMouseUp = () => {
  isActive.value = false
}

const cssVars = computed(() => ({
  '--width': Fprops.width
}))
</script>

<style lang="scss" scoped>
.genbtn {
  display: inline-block;
  height: 100%;
  width: var(--width);
  margin-left: 5px;
  margin-right: 5px;
  text-align: center;
  align-content: center;
}

.genbtn:hover {
  outline: solid white 1px;
  background-color: rgb(192, 192, 192);
}
.genbtn.real-active {
  transition: background-color 0.4s ease-out;
  background-color: cadetblue;
  outline: none;
}
</style>
