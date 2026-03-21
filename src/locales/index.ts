import { createI18n } from 'vue-i18n'

import zhCNCommon from './zh-CN/common'
import zhCNSteps from './zh-CN/steps'
import zhCNForm from './zh-CN/form'
import zhCNValidation from './zh-CN/validation'

import zhTWCommon from './zh-TW/common'
import zhTWSteps from './zh-TW/steps'
import zhTWForm from './zh-TW/form'
import zhTWValidation from './zh-TW/validation'

import enCommon from './en/common'
import enSteps from './en/steps'
import enForm from './en/form'
import enValidation from './en/validation'

export const messages = {
  'zh-CN': {
    common: zhCNCommon,
    steps: zhCNSteps,
    form: zhCNForm,
    validation: zhCNValidation,
  },
  'zh-TW': {
    common: zhTWCommon,
    steps: zhTWSteps,
    form: zhTWForm,
    validation: zhTWValidation,
  },
  en: {
    common: enCommon,
    steps: enSteps,
    form: enForm,
    validation: enValidation,
  },
}

// 支持的语言列表，后续语言切换组件会用到
export const supportedLocales = [
  { code: 'zh-CN', label: '简体中文' },
  { code: 'zh-TW', label: '繁體中文' },
  { code: 'en', label: 'English' },
]

// 默认语言
export const defaultLocale = 'zh-CN'

// 从 localStorage 读取用户上次选择的语言，没有则用默认语言
const savedLocale = localStorage.getItem('locale') || defaultLocale

export const i18n = createI18n({
  legacy: false, // 必须设为 false，才能在 Vue 3 组合式 API 中使用
  locale: savedLocale, // 当前语言
  fallbackLocale: 'zh-CN', // 找不到翻译时的备用语言
  messages,
})
