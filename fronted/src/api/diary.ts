import { request } from '@/utils/request'

export type Diary = {
  id: string
  userId: string
  title: string | null
  content: string
  entryDate: string
  createdAt: string
  updatedAt: string
}

export type DiaryListResp = {
  page: number
  pageSize: number
  total: number
  data: Diary[]
}

export type DiaryListReq = {
  userId: string
  page?: number
  pageSize?: number
  keyword?: string
}

export function apiDiaryList(data: DiaryListReq) {
  return request<DiaryListResp>({
    url: '/diaries/list',
    method: 'POST',
    data,
  })
}

export type DiaryCreateReq = {
  userId: string
  title?: string | null
  content: string
  entryDate?: string
}

export function apiDiaryCreate(data: DiaryCreateReq) {
  return request<Diary>({
    url: '/diaries',
    method: 'POST',
    data,
  })
}

export type DiaryUpdateReq = {
  userId: string
  title?: string | null
  content?: string
}

export function apiDiaryUpdate(id: string, data: DiaryUpdateReq) {
  return request<Diary>({
    url: `/diaries/${id}`,
    method: 'PUT',
    data,
  })
}

export function apiDiaryDelete(id: string, data: { userId: string }) {
  return request<{ ok: boolean }>({
    url: `/diaries/${id}`,
    method: 'DELETE',
    data,
  })
}

