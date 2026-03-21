import { defineStore } from 'pinia'
import { ref } from 'vue'

export type ThemeMode = 'light' | 'dark'

const themeStorageKey = 'theme'

const applyThemeToDom = (theme: ThemeMode) => {
  document.documentElement.setAttribute('data-theme', theme)
}

export const useThemeStore = defineStore('themeStore', () => {
  const theme = ref<ThemeMode>('light')

  const setTheme = (value: ThemeMode) => {
    theme.value = value
    applyThemeToDom(value)
    try {
      localStorage.setItem(themeStorageKey, value)
    } catch {
      console.error('错误')
    }
  }

  const toggleTheme = () => {
    setTheme(theme.value === 'dark' ? 'light' : 'dark')
  }

  const initTheme = () => {
    try {
      const saved = localStorage.getItem(themeStorageKey)
      if (saved === 'light' || saved === 'dark') {
        theme.value = saved
      }
    } catch {
      console.error('错误')
    }
    applyThemeToDom(theme.value)
  }

  return { theme, setTheme, toggleTheme, initTheme }
})
