<template>
  <q-page class="dashboard-page bg-blue-grey-1">
    <!-- Header con bienvenida -->
    <div class="dashboard-header bg-primary text-white q-pa-lg text-center">
      <div class="text-h4 q-mb-sm">¡Bienvenido, {{ userStore.user.name }}! 👋</div>
      <div class="text-subtitle1">
        {{ userStore.isTeacher ? 'Profesor' : 'Estudiante' }} · {{ userStore.user.username }}
      </div>
    </div>

    <!-- Botón central de acción -->
    <div class="row justify-center q-pt-xl">
      <div class="col-12 col-md-6 text-center">
        <q-btn
          :label="userStore.isTeacher ? 'Crear Sala de Clase' : 'Unirse a una Sesión'"
          color="primary"
          size="xl"
          class="action-btn q-px-xl q-py-md"
          @click="handleAction"
        >
          <template v-slot:loading>
            <q-spinner-gears />
          </template>
        </q-btn>
        <div class="text-caption text-grey q-mt-sm">
          {{ userStore.isTeacher ?
            'Inicia una nueva sesión interactiva' :
            'Participa en actividades en vivo'
          }}
        </div>
      </div>
    </div>

    <!-- Secciones de contenido temático -->
    <div class="content-sections q-px-lg q-pt-xl">
      <div class="text-h5 text-center q-mb-lg">Contenido Temático 📚</div>

      <div class="row q-col-gutter-lg justify-center">
        <div class="col-12 col-sm-6 col-md-4">
          <q-card class="section-card cursor-pointer" @click="openSection('matematicas')">
            <q-card-section class="text-center">
              <div class="text-h2 q-mb-md">🔢</div>
              <div class="text-h6">Matemáticas</div>
              <div class="text-caption text-grey">
                Álgebra, geometría y cálculo
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-sm-6 col-md-4">
          <q-card class="section-card cursor-pointer" @click="openSection('ciencias')">
            <q-card-section class="text-center">
              <div class="text-h2 q-mb-md">🧪</div>
              <div class="text-h6">Ciencias</div>
              <div class="text-caption text-grey">
                Física, química y biología
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-sm-6 col-md-4">
          <q-card class="section-card cursor-pointer" @click="openSection('historia')">
            <q-card-section class="text-center">
              <div class="text-h2 q-mb-md">📜</div>
              <div class="text-h6">Historia</div>
              <div class="text-caption text-grey">
                Eventos históricos y cultura
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <!-- Dialog para secciones -->
    <q-dialog v-model="showSectionDialog">
      <q-card style="width: 500px; max-width: 80vw;">
        <q-card-section>
          <div class="text-h6">{{ currentSectionTitle }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div class="text-body1">
            Contenido de {{ currentSectionTitle }} en desarrollo...
          </div>
          <div class="q-mt-md">
            Próximamente tendrás acceso a lecciones interactivas,
            ejercicios gamificados y mucho más sobre este tema.
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cerrar" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const showSectionDialog = ref(false)
const currentSection = ref('')

const currentSectionTitle = computed(() => {
  const titles = {
    matematicas: 'Matemáticas',
    ciencias: 'Ciencias',
    historia: 'Historia'
  }
  return titles[currentSection.value] || 'Contenido'
})

const handleAction = () => {
  if (userStore.isTeacher) {
    router.push('/teacher')
  } else {
    router.push('/student')
  }
}

const openSection = (section) => {
  currentSection.value = section
  showSectionDialog.value = true
}
</script>

<style scoped>
.dashboard-page {
  min-height: 100vh;
}

.dashboard-header {
  border-radius: 0 0 30px 30px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

.action-btn {
  border-radius: 25px;
  font-weight: bold;
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
  transition: transform 0.3s ease;
}

.action-btn:hover {
  transform: translateY(-2px);
}

.section-card {
  border-radius: 15px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  min-height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.section-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.15);
}
</style>
