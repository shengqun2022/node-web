<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ROUTE_LOGIN } from '@/utils/paths'
import { toastError, toastSuccess } from '@/utils/toast'
import { apiUploadImage } from '@/api/upload'
import defaultAvatar from '@/assets/default-avatar.svg'
import { Edit } from '@element-plus/icons-vue'

const router = useRouter()
const auth = useAuthStore()

const loading = ref(false)
const saving = ref(false)
const uploading = ref(false)

const form = reactive({
  avatar: '',
  nickname: '',
})

const avatarPreview = computed(() => {
  const v = String(form.avatar || '').trim()
  return v.length ? v : defaultAvatar
})

function normalizeToNullable(v: string): string | null {
  const t = (v ?? '').trim()
  return t.length ? t : null
}

async function load() {
  loading.value = true
  try {
    await auth.fetchProfile()
    // 不主动把空头像写回到输入（但 UI 会显示 defaultAvatar）
    form.avatar = auth.avatar ?? ''
    form.nickname = auth.nickname ?? ''
  } finally {
    loading.value = false
  }
}

async function onSave() {
  if (!auth.userId) return
  // 不允许清空头像：空值时不下发 avatar 字段
  const avatar = normalizeToNullable(form.avatar)
  const nickname = normalizeToNullable(form.nickname)
  if (nickname === null && avatar === null) {
    toastError('至少需要填写头像或昵称之一')
    return
  }
  saving.value = true
  try {
    await auth.updateProfile({
      ...(avatar ? { avatar } : {}),
      ...(nickname !== null ? { nickname } : {}),
    })
    toastSuccess('个人信息已更新')
  } finally {
    saving.value = false
  }
}

async function beforeUpload(file: File) {
  uploading.value = true
  try {
    const res = await apiUploadImage(file)
    // 后端返回的是绝对 url（带 host）或 urlPath，这里优先用 url
    form.avatar = res.url || res.urlPath
    // 上传成功后立即保存到用户资料（无需手动输入 URL/再点保存）
    await auth.updateProfile({ avatar: form.avatar })
    toastSuccess('头像已更新')
  } finally {
    uploading.value = false
  }
  // 阻止 el-upload 自己发请求，我们用自定义上传
  return false
}

function onLogout() {
  auth.logout()
  router.replace(ROUTE_LOGIN)
}

onMounted(load)
</script>

<template>
  <div class="wrap">
    <div class="top">
      <div class="title">个人中心</div>
      <div class="actions">
        <el-button type="danger" plain @click="onLogout">退出登录</el-button>
      </div>
    </div>

    <el-skeleton :loading="loading" animated :rows="6">
      <template #default>
        <el-card class="card">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="Email">{{ auth.email }}</el-descriptions-item>
            <el-descriptions-item label="UserId">{{ auth.userId }}</el-descriptions-item>
          </el-descriptions>

          <div class="form">
            <el-form label-position="top">
              <el-form-item label="头像">
                <el-upload
                  class="uploader"
                  :show-file-list="false"
                  accept="image/*"
                  :before-upload="beforeUpload"
                  :disabled="uploading"
                >
                  <div class="avatar-wrap">
                    <el-avatar :size="80" :src="avatarPreview" />
                    <div class="mask">
                      <el-icon><Edit /></el-icon>
                      <div class="txt">{{ uploading ? '上传中...' : '编辑' }}</div>
                    </div>
                  </div>
                </el-upload>
              </el-form-item>
              <el-form-item label="昵称">
                <el-input v-model="form.nickname" placeholder="请输入昵称" clearable />
              </el-form-item>
              <el-button type="primary" :loading="saving" :disabled="uploading" @click="onSave" style="width: 100%">
                保存
              </el-button>
            </el-form>
          </div>
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
.title {
  font-size: 20px;
  font-weight: 700;
}
.actions {
  display: flex;
  gap: 8px;
}
.card {
  border-radius: 12px;
}
.form {
  margin-top: 14px;
}

.uploader {
  display: inline-block;
}
.avatar-wrap {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
}
.mask {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  color: #fff;
  background: rgba(0, 0, 0, 0.35);
  opacity: 0;
  transition: opacity 0.18s ease;
  pointer-events: none;
}
.avatar-wrap:hover .mask {
  opacity: 1;
}
.txt {
  font-size: 12px;
  font-weight: 650;
}
</style>

