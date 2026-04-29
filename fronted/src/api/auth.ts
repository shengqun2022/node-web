import { request } from '@/utils/request'

export type LoginReq = { email: string; password: string }
export type RegisterReq = { email: string; password: string }

export type LoginResp = {
  id: string
  email: string
  createdAt: string
}

export function apiLogin(data: LoginReq) {
  return request<LoginResp>({
    url: '/login',
    method: 'POST',
    data,
  })
}

export function apiRegister(data: RegisterReq) {
  return request<LoginResp>({
    url: '/auth/register',
    method: 'POST',
    data,
  })
}
