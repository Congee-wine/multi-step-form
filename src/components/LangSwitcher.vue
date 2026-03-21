<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { supportedLocales } from '@/locales/index'

const { locale } = useI18n()

const switchLocale = (code: string) => {
  locale.value = code
  // 保存到 localStorage，下次启动自动恢复
  localStorage.setItem('locale', code)
}
</script>

<template>
  <div class="lang-switcher">
    <button
      v-for="lang in supportedLocales"
      :key="lang.code"
      :class="['lang-btn', { active: locale === lang.code }]"
      @click="switchLocale(lang.code)"
    >
      {{ lang.label }}
    </button>
  </div>
</template>

<style scoped>
.lang-switcher {
  position: absolute;
  left: 15px;
  bottom: -40px;
  display: flex;
  gap: 8px;
}

.lang-btn {
  padding: 4px 10px;
  border: 1px solid #174a89;
  border-radius: 6px;
  background: rgb(72, 62, 255);
  color: white;
  font-size: 12px;
  cursor: pointer;
  font-family: 'ubuntu-regular';
  transition: all 0.2s ease;
}

.lang-btn:hover {
  background-color: rgba(3, 41, 90);
}

.lang-btn.active {
  background-color: #ffaf7e;
  color: #12335e;
  border-color: #f9818e;
}
</style>
