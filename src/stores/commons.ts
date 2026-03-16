import { ref, reactive } from 'vue'
import { defineStore } from 'pinia'
import { IPersonal, IStep3 } from '@/types/items'

export const useCommonsStore = defineStore(
  'commonsStore',
  () => {
    // 保存时间戳（毫秒)
    const savedAt = ref<number>(Date.now())
    const nowTab = ref<string>('1')
    const plan = ref<string>('1')
    const isYearly = ref<boolean>(false)
    const totalCost = ref<string>('0')
    const visitedSteps = ref<string[]>(['1'])
    const completedSteps = ref<string[]>([])

    const personalInfo = reactive<IPersonal>({
      name: '',
      email: '',
      phone: '',
    })

    const addons = ref<Array<IStep3>>([])

    const setTabActive = (tabId: string) => {
      nowTab.value = tabId
      // 只要跳转到某个步骤，就记录为已访问
      if (!visitedSteps.value.includes(tabId)) {
        visitedSteps.value.push(tabId)
      }
    }

    const setPlanItem = (planId: string) => {
      plan.value = planId
    }

    const toggleYearly = () => {
      isYearly.value = !isYearly.value
    }

    const setAddonItems = (addon: IStep3) => {
      const index = addons.value.findIndex((item) => item.id === addon.id)

      if (index === -1) {
        addons.value.push(addon)
      } else {
        addons.value.splice(index, 1)
      }
    }

    const completeStep = (stepId: string) => {
      if (!completedSteps.value.includes(stepId)) {
        completedSteps.value.push(stepId)
      }
    }

    const clearStorage = () => {
      savedAt.value = Date.now()
      nowTab.value = '1'
      plan.value = '1'
      isYearly.value = false
      totalCost.value = '0'
      personalInfo.email = ''
      personalInfo.name = ''
      personalInfo.phone = ''
      addons.value = []
      visitedSteps.value = ['1']
      completedSteps.value = []
    }

    const removeStorege = () => {
      localStorage.removeItem('commonsStore')
    }

    return {
      savedAt,
      nowTab,
      personalInfo,
      plan,
      isYearly,
      addons,
      totalCost,
      visitedSteps,
      completedSteps,

      setTabActive,
      setPlanItem,
      toggleYearly,
      setAddonItems,
      removeStorege,
      completeStep,
      clearStorage,
    }
  },
  {
    persist: true,
  },
)
