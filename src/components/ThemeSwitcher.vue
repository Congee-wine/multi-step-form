<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()
const { theme } = storeToRefs(themeStore)
const { t } = useI18n()

const modeLabel = computed(() =>
  theme.value === 'dark' ? t('common.themeDark') : t('common.themeLight'),
)

const statusText = computed(() => t('common.themeCurrent', { mode: modeLabel.value }))
</script>

<template>
  <div class="theme-switcher">
    <button class="theme-btn" type="button" @click="themeStore.toggleTheme()">
      {{ statusText }}
    </button>
  </div>
</template>

<style scoped>
.theme-switcher {
  position: absolute;
  right: 15px;
  bottom: -40px;
  display: flex;
  gap: 8px;
}

.theme-btn {
  padding: 4px 10px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--surface);
  color: var(--text);
  font-size: 12px;
  cursor: pointer;
  font-family: 'ubuntu-regular';
  transition: all 0.2s ease;
}

.theme-btn:hover {
  border-color: var(--text);
}
</style>