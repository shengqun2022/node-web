import { request } from '@/utils/request'

export type UploadResp = {
  url: string
  urlPath: string
  filename: string
  mimetype: string
}

export function apiUploadImage(file: File) {
  const form = new FormData()
  form.append('file', file)
  return request<UploadResp>({
    url: '/upload/image',
    method: 'POST',
    data: form,
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

