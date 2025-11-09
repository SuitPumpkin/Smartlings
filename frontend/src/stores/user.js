import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  const user = ref(null)
  const isAuthenticated = computed(() => user.value !== null)
  const isTeacher = computed(() => user.value?.role === 'teacher')
  const isStudent = computed(() => user.value?.role === 'student')

  const login = (userData) => {
    user.value = {
      id: Date.now().toString(),
      name: userData.name,
      username: userData.username,
      role: userData.role,
      avatar: `avatar-${Math.floor(Math.random() * 5) + 1}`
    }
  }

  const logout = () => {
    user.value = null
  }

  return {
    user,
    isAuthenticated,
    isTeacher,
    isStudent,
    login,
    logout
  }
})
