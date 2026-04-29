import axios, { type AxiosError, type AxiosInstance, type AxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'
import { BACKEND_BASE_URL } from './env'
import { clearUserId, clearProfile } from './storage'

export type ApiErrorPayload = {
  message?: string
  detail?: string
  [k: string]: any
}

function getErrorMessage(data: any): string {
  if (!data) return '请求失败'
  if (typeof data === 'string') return data
  return data.message || data.detail || '请求失败'
}

export const http: AxiosInstance = axios.create({
  baseURL: BACKEND_BASE_URL,
  timeout: 20000,
})

http.interceptors.response.use(
  (resp) => resp,
  (err: AxiosError<ApiErrorPayload>) => {
    const status = err.response?.status
    const msg = getErrorMessage(err.response?.data) || err.message

    if (status === 401) {
      const pathname = String(location.pathname || '')
      const isAuthPage =
        pathname === '/login' ||
        pathname === '/register' ||
        pathname.startsWith('/login') ||
        pathname.startsWith('/register')

      // 后端返回 401 表示登录凭据错误/失效
      // 先提示，再根据页面决定是否跳转
      ElMessage.error(msg || '登录失败，请重新登录')

      clearUserId()
      clearProfile()

      if (!isAuthPage) {
        // 避免在 router 尚未初始化时引入循环依赖，这里用 location 直接跳转
        location.href = '/login'
      }
    } else {
      ElMessage.error(msg)
    }

    return Promise.reject(err)
  },
)

export async function request<T = any>(config: AxiosRequestConfig): Promise<T> {
  const resp = await http.request<T>(config)
  return resp.data
}

