<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { apiDiaryDelete, apiDiaryList, type Diary } from '@/api/diary'
import { toastSuccess } from '@/utils/toast'
import { useAuthStore } from '@/stores/auth'

const props = defineProps<{ id: string }>()
const router = useRouter()
const auth = useAuthStore()

const loading = ref(false)
const diary = ref<Diary | null>(null)

async function load() {
  if (!auth.userId) return
  loading.value = true
  try {
    // 后端无详情接口：通过分页列表查找对应 id
    let page = 1
    const pageSize = 20
    while (true) {
      const res = await apiDiaryList({ userId: auth.userId, page, pageSize })
      const found = res.data.find((x) => x.id === props.id)
      if (found) {
        diary.value = found
        return
      }
      if (page * pageSize >= res.total) break
      page += 1
    }
  } finally {
    loading.value = false
  }
}

async function onEdit() {
  router.push(`/diary/edit/${props.id}`)
}

async function onDelete() {
  if (!auth.userId) return
  await apiDiaryDelete(props.id, { userId: auth.userId })
  toastSuccess('已删除')
  router.replace('/diary')
}

onMounted(load)
</script>

<template>
  <div class="wrap">
    <div class="top">
      <el-button @click="router.back()">返回</el-button>
      <div class="actions">
        <el-button type="primary" @click="onEdit">编辑</el-button>
        <el-popconfirm title="确认删除该日记？" @confirm="onDelete">
          <template #reference>
            <el-button type="danger">删除</el-button>
          </template>
        </el-popconfirm>
      </div>
    </div>

    <el-skeleton :loading="loading" animated>
      <template #default>
        <el-card v-if="diary" class="card">
          <div class="title">{{ diary.title || '未命名' }}</div>
          <div class="time">{{ diary.entryDate || diary.updatedAt || diary.createdAt }}</div>
          <div class="content" style="white-space: pre-wrap">{{ diary.content }}</div>
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.actions {
  display: flex;
  gap: 8px;
}
.card {
  border-radius: 12px;
}
.title {
  font-size: 22px;
  font-weight: 650;
  margin-bottom: 6px;
}
.time {
  color: #8a8f99;
  font-size: 12px;
  margin-bottom: 12px;
}
</style>

