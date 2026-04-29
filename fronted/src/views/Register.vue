<script setup lang="ts">
import { reactive, ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ROUTE_LOGIN } from '@/utils/paths'
import { toastSuccess } from '@/utils/toast'

const router = useRouter()
const auth = useAuthStore()

const loading = ref(false)
const formRef = ref<FormInstance>()
const form = reactive({
  email: '',
  password: '',
  password2: '',
})

async function onSubmit() {
  try {
    await formRef.value?.validate()
  } catch {
    return
  }
  if (form.password !== form.password2) return
  loading.value = true
  try {
    await auth.register({ email: form.email, password: form.password })
    toastSuccess('注册成功，请登录')
    await router.replace(ROUTE_LOGIN)
  } catch {
    // 错误提示由 request 拦截器统一弹出
  } finally {
    loading.value = false
  }
}

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
  password2: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    {
      validator: (_, value, callback) => {
        const v = String(value ?? '')
        if (v !== form.password) callback(new Error('两次密码不一致'))
        else callback()
      },
      trigger: ['blur', 'change'],
    },
  ],
}
</script>

<template>
  <div class="page">
    <el-card class="card">
      <div class="title">注册</div>
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top" @submit.prevent>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" autocomplete="username" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>
        <el-form-item label="确认密码" prop="password2">
          <el-input v-model="form.password2" type="password" placeholder="请再次输入密码" show-password />
        </el-form-item>
        <el-button type="primary" :loading="loading" style="width: 100%" @click="onSubmit">注册</el-button>
      </el-form>
      <div class="footer">
        <el-button link type="primary" @click="router.push(ROUTE_LOGIN)">已有账号？去登录</el-button>
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

