import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import { createPersistedState } from 'pinia-plugin-persistedstate'
import { useCommonsStore } from './stores/commons'

const app = createApp(App)
const pinia = createPinia()

pinia.use(createPersistedState())
app.use(router)
app.use(pinia)

const commonsStore = useCommonsStore()

commonsStore.$subscribe((_, state) => {
  state.savedAt = Date.now()
})

const now = Date.now()
const sevenDays = 7 * 24 * 60 * 60 * 1000
if (commonsStore.savedAt && now - commonsStore.savedAt > sevenDays) {
  commonsStore.clearStorage()
  // commonsStore.removeStorege()
}

app.mount('#app')
