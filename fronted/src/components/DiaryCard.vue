<script setup lang="ts">
import type { Diary } from '@/api/diary'
import { Delete, Edit } from '@element-plus/icons-vue'

defineProps<{
  diary: Diary
}>()

const emit = defineEmits<{
  (e: 'edit'): void
  (e: 'delete'): void
  (e: 'open'): void
}>()

function summary(content: string) {
  const s = (content || '').trim()
  return s.length > 80 ? s.slice(0, 80) + '…' : s
}
</script>

<template>
  <el-card class="card" shadow="hover" @click="emit('open')">
    <div class="row">
      <div class="left">
        <div class="title">{{ diary.title || '未命名' }}</div>
        <div class="meta">{{ diary.entryDate || diary.createdAt || '' }}</div>
        <div class="summary">{{ summary(diary.content) }}</div>
      </div>
    </div>

    <div class="actions" @click.stop>
      <el-button circle size="small" @click="emit('edit')">
        <el-icon><Edit /></el-icon>
      </el-button>
      <el-popconfirm title="确认删除？" @confirm="emit('delete')">
        <template #reference>
          <el-button circle size="small" type="danger">
            <el-icon><Delete /></el-icon>
          </el-button>
        </template>
      </el-popconfirm>
    </div>
  </el-card>
</template>

<style scoped>
.card {
  border-radius: 12px;
  cursor: pointer;
}
.row {
  display: flex;
  gap: 12px;
}
.left {
  flex: 1;
  min-width: 0;
}
.title {
  font-weight: 650;
  font-size: 16px;
  margin-bottom: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.meta {
  font-size: 12px;
  color: #8a8f99;
  margin-bottom: 6px;
}
.summary {
  color: #4b4f57;
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
}
.actions {
  margin-top: 10px;
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}
</style>

