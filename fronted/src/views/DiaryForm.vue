<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { useRouter, useRoute } from 'vue-router'
import { apiDiaryCreate, apiDiaryList, apiDiaryUpdate } from '@/api/diary'
import { toastSuccess } from '@/utils/toast'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const id = computed(() => (typeof route.params.id === 'string' ? route.params.id : ''))
const isEdit = computed(() => Boolean(id.value))

const loading = ref(false)
const saving = ref(false)

const formRef = ref<FormInstance>()
const form = reactive({
  title: '',
  content: '',
})

const rules: FormRules = {
  content: [
    { required: true, message: '正文不能为空', trigger: 'blur' },
    {
      validator: (_, value, callback) => {
        const v = String(value ?? '').trim()
        if (!v) callback(new Error('正文不能为空'))
        else callback()
      },
      trigger: ['blur', 'change'],
    },
  ],
}

async function loadIfEdit() {
  if (!isEdit.value) return
  loading.value = true
  try {
    if (!auth.userId) return
    // 后端没有 /diaries/:id 详情接口，这里通过分页列表搜索对应 id
    let page = 1
    const pageSize = 20
    while (true) {
      const res = await apiDiaryList({ userId: auth.userId, page, pageSize })
      const found = res.data.find((x) => x.id === id.value)
      if (found) {
        form.title = found.title ?? ''
        form.content = found.content
        return
      }
      if (page * pageSize >= res.total) break
      page += 1
    }
  } finally {
    loading.value = false
  }
}

async function onSubmit() {
  try {
    await formRef.value?.validate()
  } catch {
    return
  }
  saving.value = true
  try {
    if (!auth.userId) return
    const title = form.title.trim().length ? form.title.trim() : null
    const payloadBase = { userId: auth.userId, title, content: form.content }
    if (isEdit.value) {
      await apiDiaryUpdate(id.value, payloadBase)
    } else {
      await apiDiaryCreate(payloadBase)
    }
    toastSuccess('保存成功')
    router.replace('/diary')
  } finally {
    saving.value = false
  }
}

onMounted(loadIfEdit)
</script>

<template>
  <div class="wrap">
    <div class="top">
      <el-button @click="router.back()">返回</el-button>
      <div class="title">{{ isEdit ? '编辑日记' : '新建日记' }}</div>
      <div style="width: 64px" />
    </div>

    <el-skeleton :loading="loading" animated :rows="8">
      <template #default>
        <el-card class="card">
          <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
            <el-form-item label="标题">
              <el-input v-model="form.title" placeholder="请输入标题" />
            </el-form-item>

            <el-form-item label="正文" prop="content">
              <el-input
                v-model="form.content"
                type="textarea"
                :autosize="{ minRows: 8, maxRows: 18 }"
                placeholder="写点什么..."
              />
            </el-form-item>

            <div class="actions">
              <el-button type="primary" :loading="saving" @click="onSubmit">提交</el-button>
            </div>
          </el-form>
        </el-card>
      </template>
    </el-skeleton>
  </div>
</template>

<style scoped>
.wrap {
  max-width: 920px;
  margin: 0 auto;
  padding: 16px;
}
.top {
  display: grid;
  grid-template-columns: 64px 1fr 64px;
  align-items: center;
  margin-bottom: 12px;
}
.title {
  text-align: center;
  font-size: 18px;
  font-weight: 650;
}
.card {
  border-radius: 12px;
}
.actions {
  display: flex;
  justify-content: flex-end;
}
</style>

