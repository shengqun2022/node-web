import { request } from '@/utils/request'

export type UserProfile = {
  id: string
  email: string
  avatar: string | null
  nickname: string | null
  createdAt: string
  updatedAt: string
}

export type GetUserInfoReq = {
  userId?: string
  syncId?: string
}

export function apiGetUserInfo(data: GetUserInfoReq) {
  return request<UserProfile>({
    url: '/users/info',
    method: 'POST',
    data,
  })
}

export type UpdateProfileReq = {
  userId: string
  avatar?: string | null
  nickname?: string | null
}

export function apiUpdateProfile(data: UpdateProfileReq) {
  return request<UserProfile>({
    url: '/users/profile',
    method: 'POST',
    data,
  })
}

