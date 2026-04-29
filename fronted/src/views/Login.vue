<script setup lang="ts">
import { reactive, ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ROUTE_DIARY, ROUTE_REGISTER } from '@/utils/paths'
import { toastSuccess } from '@/utils/toast'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const loading = ref(false)
const formRef = ref<FormInstance>()
const form = reactive({
  email: '',
  password: '',
})

const rules: FormRules = {
  email: [
    { required: true, message: '邮箱不能为空', trigger: 'blur' },
    {
      validator: (_, value, callback) => {
        const v = String(value ?? '').trim()
        const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
        if (!ok) callback(new Error('邮箱格式不正确'))
        else callback()
      },
      trigger: ['blur', 'change'],
    },
  ],
  password: [
    { required: true, message: '密码不能为空', trigger: 'blur' },
    {
      validator: (_, value, callback) => {
        const v = String(value ?? '')
        if (v.length < 8 || v.length > 72) callback(new Error('密码长度需在 8-72 位之间'))
        else callback()
      },
      trigger: ['blur', 'change'],
    },
  ],
}

async function onSubmit() {
  try {
    await formRef.value?.validate()
  } catch {
    return
  }
  loading.value = true
  try {
    await auth.login({ email: form.email, password: form.password })
    toastSuccess('登录成功')
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : ROUTE_DIARY
    await router.replace(redirect)
  } catch {
    // 错误提示由 request 拦截器统一弹出
  } finally {
    loading.value = false
  }
}

function goRegister() {
  router.push(ROUTE_REGISTER)
}
</script>

<template>
  <div class="page">
    <el-card class="card">
      <div class="title">登录</div>
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top" @submit.prevent>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" autocomplete="username" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            autocomplete="current-password"
            show-password
          />
        </el-form-item>
        <el-button type="primary" :loading="loading" style="width: 100%" @click="onSubmit">登录</el-button>
      </el-form>
      <div class="footer">
        <el-button link type="primary" @click="goRegister">没有账号？去注册</el-button>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px;
}
.card {
  width: 420px;
}
.title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 12px;
}
.footer {
  margin-top: 10px;
  display: flex;
  justify-content: flex-end;
}
</style>

