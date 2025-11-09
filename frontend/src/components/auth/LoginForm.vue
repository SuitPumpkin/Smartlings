<template>
  <q-page class="flex flex-center bg-primary">
    <q-card class="login-card q-pa-xl shadow-24">
      <q-card-section class="text-center">
        <div class="text-h4 text-weight-bold q-mb-md text-white">
          🎮 SMARTLINGS
        </div>
        <div class="text-subtitle1 text-grey-4">
          Plataforma Educativa Gamificada
        </div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="handleLogin" class="q-gutter-md">
          <q-input
            v-model="form.name"
            label="Nombre completo"
            outlined
            dark
            color="white"
            class="custom-input"
            :rules="[val => !!val || 'El nombre es obligatorio']"
          >
            <template v-slot:prepend>
              <q-icon name="person" color="white" />
            </template>
          </q-input>

          <q-input
            v-model="form.username"
            label="Nombre de usuario"
            outlined
            dark
            color="white"
            class="custom-input"
            :rules="[val => !!val || 'El usuario es obligatorio']"
          >
            <template v-slot:prepend>
              <q-icon name="badge" color="white" />
            </template>
          </q-input>

          <q-option-group
            v-model="form.role"
            :options="roleOptions"
            color="white"
            dark
            class="q-mb-lg"
          />

          <q-btn
            label="Iniciar Sesión"
            type="submit"
            color="secondary"
            size="lg"
            class="full-width q-mt-md"
            :loading="loading"
          />
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)

const form = ref({
  name: '',
  username: '',
  role: 'student'
})

const roleOptions = [
  { label: '👨‍🎓 Estudiante', value: 'student' },
  { label: '👨‍🏫 Profesor', value: 'teacher' }
]

const handleLogin = async () => {
  loading.value = true

  // Simular proceso de login
  setTimeout(() => {
    userStore.login(form.value)
    loading.value = false
    router.push('/dashboard')
  }, 1000)
}
</script>

<style scoped>
.login-card {
  width: 100%;
  max-width: 400px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
}

.custom-input {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}

:deep(.q-field--outlined .q-field__control) {
  border-radius: 10px;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

:deep(.q-field--focused .q-field__control) {
  border-color: white !important;
}
</style>
