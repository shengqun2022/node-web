import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ROUTE_DIARY, ROUTE_LOGIN, ROUTE_PROFILE, ROUTE_REGISTER } from '@/utils/paths'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: ROUTE_DIARY },
    {
      path: ROUTE_LOGIN,
      component: () => import('@/views/Login.vue'),
      meta: { public: true },
    },
    {
      path: ROUTE_REGISTER,
      component: () => import('@/views/Register.vue'),
      meta: { public: true },
    },
    {
      path: ROUTE_DIARY,
      component: () => import('@/views/DiaryList.vue'),
    },
    {
      path: '/diary/new',
      component: () => import('@/views/DiaryForm.vue'),
    },
    {
      path: '/diary/edit/:id',
      component: () => import('@/views/DiaryForm.vue'),
      props: true,
    },
    {
      path: '/diary/:id',
      component: () => import('@/views/DiaryDetail.vue'),
      props: true,
    },
    {
      path: ROUTE_PROFILE,
      component: () => import('@/views/Profile.vue'),
    },
  ],
})

router.beforeEach((to) => {
  if (to.meta.public) return true
  const auth = useAuthStore()
  const isProtected = String(to.path).startsWith('/diary') || to.path === ROUTE_PROFILE
  if (!auth.isLoggedIn && isProtected) {
    return { path: ROUTE_LOGIN, query: { redirect: to.fullPath } }
  }
  return true
})

export default router

