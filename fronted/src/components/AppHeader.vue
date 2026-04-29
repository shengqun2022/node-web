<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import defaultAvatar from '@/assets/default-avatar.svg'
import { ROUTE_PROFILE } from '@/utils/paths'

const router = useRouter()
const auth = useAuthStore()

onMounted(() => {
  // 确保刷新后也能拿到头像/昵称
  auth.fetchProfile().catch(() => {})
})

const avatarSrc = computed(() => auth.avatar || defaultAvatar)
const nickname = computed(() => auth.nickname || auth.email || '用户')

function goProfile() {
  router.push(ROUTE_PROFILE)
}
</script>

<template>
  <div class="header">
    <div class="left" @click="goProfile">
      <el-avatar :size="32" :src="avatarSrc" />
      <div class="name">{{ nickname }}</div>
    </div>
  </div>
</template>

<style scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 10;
  height: 56px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  background: rgba(245, 247, 250, 0.9);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}
.left {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;
}
.name {
  font-weight: 650;
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>

