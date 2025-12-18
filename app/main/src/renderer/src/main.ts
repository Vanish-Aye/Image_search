import './style/variables.scss'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import { RecycleScroller } from 'vue-virtual-scroller'

import { createApp } from 'vue'
import App from './App.vue'

import { createPinia, storeToRefs } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
const app = createApp(App)
app.component('RecycleScroller', RecycleScroller)

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
app.use(pinia)

app.mount('#app')

import { Window_Store } from '@renderer/store/all_store'
const { theme } = storeToRefs(Window_Store())
console.log(theme.value)
document.documentElement.setAttribute('data-theme', theme.value)
