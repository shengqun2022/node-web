import { ElMessage } from 'element-plus'

export function toastSuccess(message: string) {
  ElMessage.success(message)
}

export function toastError(message: string) {
  ElMessage.error(message)
}

