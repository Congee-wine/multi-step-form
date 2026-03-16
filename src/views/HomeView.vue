<script setup lang="ts">
/* eslint-disable */
// 以上为一个注释指令，
// 告诉 ESLint（一个代码检查工具）忽略这个文件的所有规则，
// 通常是为了避免一些不必要的警告
import { computed, ref, reactive, watch, onMounted } from 'vue'
import { IContent } from '@/types/content'
import { IStep2, IStep3 } from '@/types/items'
import { storeToRefs } from 'pinia'

import _ from 'lodash'

import { useCommonsStore } from '@/stores/commons'

import { isValidEmail, isValidPhone } from '@/utils/validators'

import tabs from '@/assets/data/tabs-info.json'
import content from '@/assets/data/content.json'
import items from '@/assets/data/items.json'

const commonsStore = useCommonsStore()

//left nav

// 这个对象用于存储当前显示的步骤页面的标题和副标题
let nowContent: IContent = reactive({
  id: '',
  title: '',
  semititle: '',
})

// 用于切换当前显示的步骤
const setTabContent = (tabId: string) => {
  commonsStore.setTabActive(tabId)

  content.forEach((item: IContent) => {
    if (item.id === commonsStore.nowTab) {
      nowContent = item
    }
  })
}

const onSubmit = (): void => {
  if (
    (commonsStore.nowTab === '1' && checkForm()) ||
    commonsStore.nowTab === '2' ||
    commonsStore.nowTab === '3' ||
    commonsStore.nowTab === '4'
  ) {
    commonsStore.completeStep(commonsStore.nowTab)
    setTabContent(String(Number(commonsStore.nowTab) + 1))
  }
}

const goBack = (): void => {
  setTabContent(String(Number(commonsStore.nowTab) - 1))
}

// step2
const { isYearly } = storeToRefs(commonsStore)

const setOptions = () => {
  commonsStore.toggleYearly()
  console.log(isYearly.value)
}

// step4
const { totalCost } = storeToRefs(commonsStore)

const nowPlan = computed<IStep2>(() => {
  return (
    items.STEP2.find((item: IStep2) => item.id === commonsStore.plan) ||
    items.STEP2[0]
  )
})

const sumCost = () => {
  // 1. 获取当前选中套餐的价格

  // replace(/[^0-9]/g, '') 的作用是：
  // 从一个字符串中提取出所有的数字字符，
  // 并将它们拼接成一个新的字符串，
  // 任何非数字的字符都会被过滤掉
  const planCost: string = isYearly.value
    ? _.cloneDeep(nowPlan.value).yearly.replace(/[^0-9]/g, '')
    : _.cloneDeep(nowPlan.value).monthly.replace(/[^0-9]/g, '')

  // 2. 计算所有已选附加服务的价格总和
  let addonCosts: Array<number> = []
  commonsStore.addons.forEach((addon: IStep3) => {
    isYearly.value
      ? addonCosts.push(
          Number(_.cloneDeep(addon).yearly.replace(/[^0-9]/g, '')),
        )
      : addonCosts.push(
          Number(_.cloneDeep(addon).monthly.replace(/[^0-9]/g, '')),
        )
  })

  totalCost.value = isYearly.value
    ? '$' + String(Number(planCost) + _.sum(addonCosts)) + '/yr'
    : '$' + String(Number(planCost) + _.sum(addonCosts)) + '/mo'
}

watch(
  () => commonsStore.nowTab,
  () => {
    // commonsStore.completeStep(commonsStore.nowTab)
    if (commonsStore.nowTab === '4') {
      sumCost()
    }
    if (commonsStore.nowTab === '5') {
      commonsStore.removeStorege()
    }
  },
)

// validation check
// 表单验证逻辑
const touched = reactive({
  name: !!commonsStore.personalInfo.name,
  email: !!commonsStore.personalInfo.email,
  phone: !!commonsStore.personalInfo.phone,
})

// 表单校验防抖
// 1. 创建“延迟输入值”，不直接验证 commonsStore 的值
const debouncedForm = reactive({
  name: '',
  email: '',
  phone: '',
})

const syncPersonalInfoToDebouncedForm = () => {
  const { name, email, phone } = commonsStore.personalInfo

  debouncedForm.name = name
  debouncedForm.email = email
  debouncedForm.phone = phone
}

onMounted(() => {
  syncPersonalInfoToDebouncedForm()
})

// 2. 创建防抖更新函数
const updateDebouncedForm = _.debounce(() => {
  syncPersonalInfoToDebouncedForm()
}, 300)

// 3. watch 用户输入
watch(
  () => commonsStore.personalInfo,
  () => {
    updateDebouncedForm()
  },
  { deep: true, immediate: true },
)

// 4. computed 使用 debouncedForm 做验证
const nameValidation = computed(() => {
  if (!touched.name) return { required: true, success: true }

  const name = debouncedForm.name

  const required = !_.isEmpty(name)

  return {
    required,
    success: required,
  }
})

const emailValidation = computed(() => {
  if (!touched.email) return { required: true, success: true }

  const email = debouncedForm.email

  const required = !_.isEmpty(email)
  const format = isValidEmail(email)

  return {
    required,
    format,
    success: required && format,
  }
})

const phoneValidation = computed(() => {
  if (!touched.phone) return { required: true, success: true }

  const phone = debouncedForm.phone

  const required = !_.isEmpty(phone)
  const format = isValidPhone(phone)

  return {
    required,
    format,
    success: required && format,
  }
})

const validation = computed(() => ({
  name: nameValidation.value,
  email: emailValidation.value,
  phone: phoneValidation.value,
}))

const isFormValid = computed(() => {
  return (
    validation.value.name.success &&
    validation.value.email.success &&
    validation.value.phone.success
  )
})

const checkForm = () => {
  return isFormValid.value
}

// 动态错误消息
const createErrorMessage = (
  field: 'name' | 'email' | 'phone',
  messages?: string,
) => {
  return computed(() => {
    const fieldValidation = validation.value[field]

    if (!fieldValidation.required) {
      return '此字段为必填项'
    } else if ('format' in fieldValidation && !fieldValidation.format) {
      return messages
    }

    return ''
  })
}

const showOrderTip = ref(false)
const handleStepClick = (tabId: string) => {
  if (commonsStore.nowTab === '5') return

  if (
    commonsStore.visitedSteps.includes(tabId) ||
    tabId === commonsStore.nowTab
  ) {
    setTabContent(tabId)
  } else {
    showOrderTip.value = true
    setTimeout(() => {
      showOrderTip.value = false
    }, 4000)
  }
}

// 初始化执行
setTabContent(commonsStore.nowTab)
</script>

<template>
  <div class="home">
    <div id="container">
      <div class="box">
        <div class="navbar">
          <ul>
            <li v-for="tab in tabs" :key="tab.id" class="step">
              <div
                :class="[
                  'num',
                  { clicked: tab.id === commonsStore.nowTab },
                  {
                    completed:
                      commonsStore.completedSteps.includes(tab.id) &&
                      tab.id !== commonsStore.nowTab,
                  },
                  {
                    visited:
                      commonsStore.visitedSteps.includes(tab.id) &&
                      tab.id !== commonsStore.nowTab,
                  },
                ]"
                @click="handleStepClick(tab.id)"
              >
                {{ tab.id }}
              </div>
              <div class="item">
                <div class="step-nm">{{ tab.step }}</div>
                <div class="name">{{ tab.name }}</div>
              </div>
            </li>
          </ul>
        </div>

        <div v-if="showOrderTip" class="order-tip">请按顺序完成步骤</div>

        <div class="content">
          <div class="title top-area" v-if="nowContent.title">
            {{ nowContent.title }}
          </div>
          <div class="semi-title" v-if="nowContent.semititle">
            {{ nowContent.semititle }}
          </div>
          <div class="forms">
            <!--          STEP 1          -->
            <div v-if="commonsStore.nowTab === '1'">
              <div class="form form-name">
                <div class="labels">
                  <label for="name" class="label-name">姓名</label>
                  <label
                    for="name"
                    v-if="touched.name && validation.name.required === false"
                    class="alert"
                  >
                    {{ createErrorMessage('name') }}
                  </label>
                </div>
                <div class="input-wrapper">
                  <input
                    v-model="commonsStore.personalInfo.name"
                    type="text"
                    id="name"
                    @blur="touched.name = true"
                    placeholder="例如：张三"
                    :class="[
                      {
                        error:
                          touched.name && validation.name.required === false,
                      },
                    ]"
                    required
                  />
                  <img
                    v-if="touched.name && validation.name.success"
                    src="@/assets/images/icon-checkmark.svg"
                    class="input-success-icon"
                  />
                </div>
              </div>

              <div class="form form-email">
                <div class="labels">
                  <label for="email" class="label-name">电子邮件地址</label>
                  <label
                    for="email"
                    v-if="touched.email && validation.email.success === false"
                    class="alert"
                  >
                    {{ createErrorMessage('email', '邮箱格式不正确') }}
                  </label>
                </div>
                <div class="input-wrapper">
                  <input
                    v-model="commonsStore.personalInfo.email"
                    type="text"
                    id="email"
                    @blur="touched.email = true"
                    placeholder="例如：zhangsan@example.com"
                    :class="[
                      {
                        error:
                          touched.email && validation.email.success === false,
                      },
                    ]"
                    required
                  />
                  <img
                    v-if="touched.email && validation.email.success"
                    src="@/assets/images/icon-checkmark.svg"
                    class="input-success-icon"
                  />
                </div>
              </div>

              <div class="form form-phone">
                <div class="labels">
                  <label for="phone" class="label-name">电话号码</label>
                  <label
                    for="phone"
                    v-if="touched.phone && validation.phone.success === false"
                    class="alert"
                  >
                    {{ createErrorMessage('phone', '手机号格式不正确') }}
                  </label>
                </div>
                <div class="input-wrapper">
                  <input
                    v-model="commonsStore.personalInfo.phone"
                    type="text"
                    id="phone"
                    @blur="touched.phone = true"
                    placeholder="例如：+86 138 0000 0000"
                    :class="[
                      {
                        error:
                          touched.phone && validation.phone.success === false,
                      },
                    ]"
                    required
                  />
                  <img
                    v-if="touched.phone && validation.phone.success"
                    src="@/assets/images/icon-checkmark.svg"
                    class="input-success-icon"
                  />
                </div>
              </div>
            </div>

            <!--          STEP 2          -->
            <div v-else-if="commonsStore.nowTab === '2'">
              <!-- 3 buttons -->
              <div class="options">
                <button
                  v-for="item in items.STEP2"
                  :key="item.name"
                  :class="[
                    'option non-selected',
                    { selected: item.id === commonsStore.plan },
                  ]"
                  @click="commonsStore.setPlanItem(item.id)"
                >
                  <img
                    :src="require(`@/assets/images/${item.icon}`)"
                    class="icon"
                  />
                  <div class="info">
                    <div class="option-nm card-nm">{{ item.name }}</div>
                    <div class="dollar card-des" v-if="!isYearly">
                      {{ item.monthly }}
                    </div>
                    <div class="dollar card-des" v-if="isYearly">
                      {{ item.yearly }}
                    </div>
                    <div v-if="isYearly" class="discount">
                      {{ item.discount }}
                    </div>
                  </div>
                </button>
              </div>

              <!-- toggle -->
              <div class="select-area">
                <div class="btn-area">
                  <span :class="['period', { 'm-or-y': !isYearly }]">月度</span>
                  <span class="toggle">
                    <input
                      type="checkbox"
                      id="toggle"
                      :checked="isYearly"
                      @change="setOptions"
                      hidden
                    />
                    <label for="toggle" class="switch">
                      <span class="toggle-btn"></span>
                    </label>
                  </span>
                  <span :class="['period', { 'm-or-y': isYearly }]">年度</span>
                </div>
              </div>
            </div>

            <!--          STEP 3          -->
            <div v-else-if="commonsStore.nowTab === '3'" class="third-step">
              <div class="addons">
                <button
                  v-for="addon in items.STEP3"
                  :key="addon.id"
                  :class="[
                    'addon non-selected',
                    {
                      selected: commonsStore.addons.some(
                        (item) => item.id === addon.id,
                      ),
                    },
                  ]"
                  @click="commonsStore.setAddonItems(addon)"
                >
                  <span
                    :class="[
                      'checkbox',
                      {
                        check: commonsStore.addons.some(
                          (item) => item.id === addon.id,
                        ),
                      },
                    ]"
                  >
                    <img src="@/assets/images/icon-checkmark.svg" />
                  </span>
                  <div class="txts">
                    <div class="card-nm">{{ addon.title }}</div>
                    <div class="card-des">{{ addon.semititle }}</div>
                  </div>
                  <div class="price" v-if="!isYearly">{{ addon.monthly }}</div>
                  <div class="price" v-if="isYearly">{{ addon.yearly }}</div>
                </button>
              </div>
            </div>

            <!--          STEP 4          -->
            <div v-else-if="commonsStore.nowTab === '4'" class="finishing">
              <div class="costs">
                <div
                  :class="[
                    'plan-wrap',
                    { plus: commonsStore.addons.length !== 0 },
                  ]"
                >
                  <div class="plan">
                    <div class="name impt-txt">
                      <div>{{ nowPlan.name }}</div>
                      <div v-if="!isYearly">&nbsp;（月度）</div>
                      <div v-if="isYearly">&nbsp;（年度）</div>
                    </div>
                    <div
                      @click="() => (commonsStore.nowTab = '2')"
                      class="change-plan"
                    >
                      更改
                    </div>
                  </div>
                  <div class="plan-cost mg-lft impt-txt">
                    <span class="">{{
                      isYearly ? nowPlan.yearly : nowPlan.monthly
                    }}</span>
                  </div>
                </div>

                <div class="addon-wrap" v-if="commonsStore.addons.length !== 0">
                  <div
                    v-for="addon in commonsStore.addons"
                    :key="addon.id"
                    class="addons"
                  >
                    <span>{{ addon.title }}</span>
                    <div class="addon-cost mg-lft">
                      <span v-if="!isYearly">{{ addon.monthly }}</span>
                      <span v-if="isYearly">{{ addon.yearly }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="total">
                <span v-if="!isYearly">总计（每月）</span>
                <span v-if="isYearly">总计（每年）</span>
                <span class="total-cost mg-lft">{{ totalCost }}</span>
              </div>
            </div>

            <!--          Thank you page          -->
            <div v-if="commonsStore.nowTab === '5'">
              <div class="appreciate">
                <img
                  src="@/assets/images/icon-thank-you.svg"
                  class="thankyou-icon"
                />
                <div class="thank-you">感谢您的订阅！</div>
                <div class="notice">
                  感谢您确认订阅！我们希望您使用愉快。如果您需要任何支持，请随时发送电子邮件至
                  support@loremgaming.com 联系我们。
                </div>
              </div>
            </div>
          </div>
          <div
            :class="['btns', { none: commonsStore.nowTab === '5' }]"
            v-if="commonsStore.nowTab !== '5'"
          >
            <button
              class="lft-btn"
              @click="goBack"
              v-if="commonsStore.nowTab !== '1'"
            >
              返回
            </button>
            <button
              class="rgt-btn"
              v-if="commonsStore.nowTab !== '4'"
              @click="onSubmit"
            >
              下一步
            </button>
            <button
              class="rgt-btn confirm"
              v-else-if="commonsStore.nowTab === '4'"
              @click="onSubmit"
            >
              确认
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
