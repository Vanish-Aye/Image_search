<template>
  <div class="inputgroup" :style="cssVars">
    <input
      id="sentence_input"
      v-model="inputValue"
      :class="{ 'has-content': inputValue }"
      @input="checkContent"
      @keydown.enter="props.handleEnter"
    />
    <span class="highlight" />
    <span class="bar" />
    <label class="labelClass1">
      <slot>{{ myName }}</slot>
    </label>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, PropType } from 'vue'

const inputValue = ref('')
const hasContent = ref(false)

const props = defineProps({
  myName: {
    type: String,
    required: false,
    default: 'default'
  },
  width: {
    type: String,
    required: false,
    default: '400px'
  },
  height: {
    type: String,
    required: false,
    default: '50px'
  },
  textcolor: {
    type: String,
    required: false,
    default: 'rgb(255, 255, 255)'
  },
  handleEnter: {
    type: Function as PropType<(event: KeyboardEvent) => void>,
    required: false,
    default: () => {
      console.log('Input Enter Function.')
    }
  }
})

const checkContent = () => {
  hasContent.value = inputValue.value.trim() !== ''
}

const cssVars = computed(() => ({
  '--width': props.width,
  '--height': props.height,
  '--text-color': props.textcolor
}))

defineExpose({ inputValue })
</script>

<style scoped>
.inputgroup {
  position: relative;
  width: var(--width);
  height: var(--height);
  margin: 15px;
}

#sentence_input {
  position: relative;
  color: var(--text-color);
  width: 100%;
  top: 30%;
  font-size: 16px;
  padding: 0px;
  display: block;
  border: none;
  border-bottom: 1px solid #515151;
  background: transparent;
  outline: none;
}

#sentence_input:focus ~ .labelClass1 {
  color: #5264ae;
  font-size: 13px;
  top: -8px;
}

#sentence_input.has-content ~ .labelClass1 {
  color: #5264ae;
  font-size: 13px;
  top: -8px;
}

.labelClass1 {
  color: #696161;
  font-size: 17px;
  font-weight: normal;
  position: absolute;
  pointer-events: none;
  left: 5px;
  top: 10px;
  transition: 0.2s ease all;
  -moz-transition: 0.2s ease all;
  -webkit-transition: 0.2s ease all;
}

.bar {
  position: relative;
  top: 35%;
  display: block;
  width: 100%;
}

.bar:before,
.bar:after {
  content: '';
  height: 2px;
  width: 0;
  bottom: 1px;
  position: absolute;
  background: #5264ae;
  transition: 0.2s ease all;
  -moz-transition: 0.2s ease all;
  -webkit-transition: 0.2s ease all;
}

.bar:before {
  left: 50%;
}

.bar:after {
  right: 50%;
}

#sentence_input:focus ~ .bar:before,
#sentence_input:focus ~ .bar:after {
  width: 50%;
}

.highlight {
  position: absolute;
  height: 50%;
  width: calc(var(--width) / 4);
  top: 25%;
  left: 0;
  pointer-events: none;
  opacity: 0.5;
}

#sentence_input:focus ~ .highlight {
  animation: inputHighlighter 0.3s ease;
}

@keyframes inputHighlighter {
  from {
    background: #5264ae;
  }

  to {
    width: 0;
    background: transparent;
  }
}
</style>
