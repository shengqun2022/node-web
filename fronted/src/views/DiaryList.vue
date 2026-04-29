<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { apiDiaryDelete, apiDiaryList, type Diary } from '@/api/diary'
import { useAuthStore } from '@/stores/auth'
import { toastSuccess } from '@/utils/toast'
import DiaryCard from '@/components/DiaryCard.vue'
import { ROUTE_LOGIN } from '@/utils/paths'

const router = useRouter()
const auth = useAuthStore()

const loading = ref(false)
const list = ref<Diary[]>([])
const page = ref(1)
const pageSize = ref(20)

async function load() {
  if (!auth.userId) return
  loading.value = true
  try {
    const res = await apiDiaryList({
      userId: auth.userId,
      page: page.value,
      pageSize: pageSize.value,
    })
    list.value = res.data
  } finally {
    loading.value = false
  }
}

function onNew() {
  router.push('/diary/new')
}

function onOpen(d: Diary) {
  router.push(`/diary/${d.id}`)
}

function onEdit(d: Diary) {
  router.push(`/diary/edit/${d.id}`)
}

async function onDelete(d: Diary) {
  if (!auth.userId) return
  await apiDiaryDelete(d.id, { userId: auth.userId })
  toastSuccess('已删除')
  await load()
}

function onLogout() {
  auth.logout()
  router.replace(ROUTE_LOGIN)
}

function onProfile() {
  router.push('/profile')
}

onMounted(load)
</script>

<template>
  <div class="wrap">
    <div class="top">
      <div class="brand">我的日记</div>
      <div class="actions">
        <el-button type="primary" @click="onNew">新建日记</el-button>
        <el-button @click="onProfile">个人中心</el-button>
        <el-button @click="load" :loading="loading">刷新</el-button>
        <el-button type="danger" plain @click="onLogout">退出登录</el-button>
      </div>
    </div>

    <el-skeleton :loading="loading" animated :rows="6">
      <template #default>
        <div class="grid">
          <DiaryCard
            v-for="d in list"
            :key="String(d.id)"
            :diary="d"
            @open="onOpen(d)"
            @edit="onEdit(d)"
            @delete="onDelete(d)"
          />
        </div>
        <el-empty v-if="!list.length" description="暂无日记，先写一篇吧" />
      </template>
    </el-skeleton>
  </div>
</template>

<style scoped>
.wrap {
  max-width: 1100px;
  margin: 0 auto;
  padding: 16px;
}
.top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  gap: 12px;
}
.brand {
  font-size: 20px;
  font-weight: 700;
}
.actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 12px;
}
</style>

