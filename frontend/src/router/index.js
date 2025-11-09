import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/components/auth/LoginForm.vue')
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/components/dashboard/DashboardView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/teacher',
    name: 'Teacher',
    component: () => import('@/components/dashboard/TeacherDashboard.vue'),
    meta: { requiresAuth: true, requiresTeacher: true }
  },
  {
    path: '/student',
    name: 'Student',
    component: () => import('@/components/dashboard/StudentDashboard.vue'),
    meta: { requiresAuth: true, requiresStudent: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()

  if (to.meta.requiresAuth && !userStore.isAuthenticated) {
    next('/login')
  } else if (to.meta.requiresTeacher && !userStore.isTeacher) {
    next('/dashboard')
  } else if (to.meta.requiresStudent && !userStore.isStudent) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
