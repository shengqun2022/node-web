import { defineStore } from 'pinia'
import { apiLogin, apiRegister, type LoginReq, type RegisterReq } from '@/api/auth'
import { apiGetUserInfo, apiUpdateProfile, type UpdateProfileReq } from '@/api/users'
import { clearProfile, clearUserId, getProfile, getUserId, setProfile, setUserId } from '@/utils/storage'

export type AuthState = {
  userId: string | null
  email: string | null
  avatar: string | null
  nickname: string | null
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    userId: getUserId(),
    email: null,
    avatar: null,
    nickname: null,
  }),
  getters: {
    isLoggedIn: (state) => Boolean(state.userId),
  },
  actions: {
    async login(payload: LoginReq) {
      const res = await apiLogin(payload)
      this.userId = res.id
      this.email = res.email
      setUserId(res.id)
      // 登录后先清空旧 profile，等用户中心再加载/编辑
      this.avatar = null
      this.nickname = null
      clearProfile()
      return res
    },
    async register(payload: RegisterReq) {
      await apiRegister(payload)
    },
    async fetchProfile() {
      if (!this.userId) return null
      const cached = getProfile<any>()
      if (cached && cached.id === this.userId) {
        this.avatar = cached.avatar ?? null
        this.nickname = cached.nickname ?? null
        this.email = cached.email ?? null
        return cached
      }
      const p = await apiGetUserInfo({ userId: this.userId })
      this.avatar = p.avatar
      this.nickname = p.nickname
      this.email = p.email
      setProfile(p)
      return p
    },
    async updateProfile(payload: Omit<UpdateProfileReq, 'userId'>) {
      if (!this.userId) return null
      const p = await apiUpdateProfile({
        userId: this.userId,
        ...payload,
      })
      this.avatar = p.avatar
      this.nickname = p.nickname
      this.email = p.email
      setProfile(p)
      return p
    },
    logout() {
      this.userId = null
      this.email = null
      this.avatar = null
      this.nickname = null
      clearUserId()
      clearProfile()
    },
  },
})

