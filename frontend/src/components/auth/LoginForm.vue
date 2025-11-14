<template>
  <q-page class="flex flex-center login-page">
    <div class="login-container">
      <!-- Logo -->
      <div class="logo-section text-center q-mb-lg">
        <img src="/smartlings.png" alt="Smartlings" class="logo" />
      </div>

      <div class="login-texts q-mb-lg">
        <p class="title text-center"><strong>Iniciar sesión</strong></p>
        <p class="subtitle text-center">
          Ingresa tu correo electrónico y selecciona tu rol para continuar.
        </p>
      </div>


      <!-- Formulario -->
      <q-card class="login-card q-pa-xl">
        <q-card-section class="q-pb-none">
          <q-form @submit="handleLogin" class="q-gutter-md">
            <!-- Input de Correo -->
            <q-input
              v-model="form.email"
              label="Correo electrónico"
              outlined
              bg-color="white"
              color="text-black"
              class="custom-input"
              :rules="[val => !!val || 'El correo es obligatorio']"
            >
            <template v-slot:prepend>
              <q-icon name="fa-solid fa-id-card" color="gray" />
            </template>
            </q-input>

            <!-- Selector de Rol -->
            <q-option-group
              v-model="form.role"
              :options="roleOptions"
              color="primary-blue"
              class="q-mb-md"
            />

            <!-- Botón Continuar -->
            <q-btn
              label="Continuar"
              type="submit"
              class="continue-btn full-width q-mt-md"
              :loading="loading"
            />
          </q-form>
        </q-card-section>

        <!-- Separador -->
        <q-card-section class="text-center q-pt-none">
          <div class="separator q-my-lg">
            <span class="separator-text">o</span>
          </div>
        </q-card-section>

        <!-- Botones Sociales -->
        <q-card-section class="q-pt-none">
          <div class="row q-gutter-sm">
            <div class="col">
              <q-btn
                label="Google"
                class="social-btn full-width"
                @click="loginWithGoogle"
              >
                <template v-slot:prepend>
                  <q-icon name="img:https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" size="20px" />
                </template>
              </q-btn>
            </div>
            <div class="col">
              <q-btn
                label="Apple"
                class="social-btn full-width"
                @click="loginWithApple"
              >
                <template v-slot:prepend>
                  <q-icon name="apple" size="20px" />
                </template>
              </q-btn>
            </div>
          </div>
        </q-card-section>

        <!-- Texto Legal -->
        <q-card-section class="text-center legal-text q-pt-none">
          Al continuar, aceptas los Términos de uso y Política de privacidad de Smartlings.
        </q-card-section>
      </q-card>
    </div>
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
  email: '',
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
    userStore.login({
      name: form.value.email.split('@')[0], // Usar parte del email como nombre
      username: form.value.email,
      role: form.value.role
    })
    loading.value = false
    router.push('/dashboard')
  }, 1000)
}

const loginWithGoogle = () => {
  alert('Login con Google en desarrollo')
}

const loginWithApple = () => {
  alert('Login con Apple en desarrollo')
}
</script>

<style scoped>
.login-page {
  background: #FFF7E0; /* BG Neutral Cream */
  min-height: 100vh;
}

.login-container {
  width: 100%;
  max-width: 400px;
  padding: 20px;
}

.logo {
  max-width: 300px;
  height: auto;
}

.login-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.custom-input {
  border-radius: 10px;
}

:deep(.q-field--outlined .q-field__control) {
  border-radius: 10px;
  border: 1px solid #5B5B5B; /* Pastel Grey */
}

:deep(.q-field--focused .q-field__control) {
  border-color: #2D9CDB !important; /* Primary Blue */
}

:deep(.q-field__label) {
  color: #333333; /* Text Black */
}

:deep(.q-field__native) {
  color: #333333; /* Text Black */
}

.continue-btn {
  background: #2D9CDB; /* Primary Blue */
  color: white;
  border-radius: 10px;
  padding: 12px;
  font-weight: bold;
  box-shadow: 0 4px 12px rgba(45, 156, 219, 0.3);
  transition: all 0.3s ease;
}

.continue-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(45, 156, 219, 0.4);
}

.social-btn {
  background: white;
  color: #333333; /* Text Black */
  border: 1px solid #5B5B5B; /* Pastel Grey */
  border-radius: 10px;
  padding: 12px;
}

.separator {
  position: relative;
  text-align: center;
}

.separator::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: #5B5B5B; /* Pastel Grey */
}

.separator-text {
  background: white;
  padding: 0 15px;
  color: #5B5B5B; /* Pastel Grey */
  position: relative;
  z-index: 1;
}

.legal-text {
  color: #5B5B5B; /* Pastel Grey */
  font-size: 12px;
  line-height: 1.4;
}

.login-texts .title {
  font-size: 20px;           /* Más grande, pero suave */
  color: #333333;            /* Negro suave */
  margin-bottom: 4px;        /* Muy pequeño para no verse separado */
}

.login-texts .subtitle {
  font-size: 14px;           /* Texto pequeño y amigable */
  color: #5B5B5B;            /* Gris pastel (ya lo usas para inputs) */
  line-height: 1.4;
  margin-top: 0;
}

</style>
