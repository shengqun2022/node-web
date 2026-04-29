const USER_ID_KEY = 'userId'
const PROFILE_KEY = 'profile'

export function getUserId(): string | null {
  return localStorage.getItem(USER_ID_KEY)
}

export function setUserId(userId: string) {
  localStorage.setItem(USER_ID_KEY, userId)
}

export function clearUserId() {
  localStorage.removeItem(USER_ID_KEY)
}

export function getProfile<T = any>(): T | null {
  const raw = localStorage.getItem(PROFILE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export function setProfile(profile: any) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile ?? null))
}

export function clearProfile() {
  localStorage.removeItem(PROFILE_KEY)
}

