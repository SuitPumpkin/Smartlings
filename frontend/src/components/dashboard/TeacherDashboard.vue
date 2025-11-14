<template>
  <q-page class="teacher-dashboard bg-blue-grey-1">

    <!-- ========================= -->
    <!-- 🟦 Header elegante -->
    <!-- ========================= -->
    <div class="teacher-header text-white q-pa-xl">
      <div class="row items-center">
        <div class="col">

          <div class="text-h4 text-bold">Salas</div>

          <div class="text-subtitle1 opacity-90">
            Crea entornos interactivos para tus estudiantes
          </div>

        </div>

        <div class="col-auto">
          <q-btn
            label="Volver al Dashboard"
            color="white"
            text-color="primary"
            unelevated
            class="return-btn"
            @click="$router.push('/dashboard')"
          />
        </div>
      </div>
    </div>

    <!-- ========================= -->
    <!-- 🎯 Contenido -->
    <!-- ========================= -->
    <div class="q-pa-xl">

      <!-- Crear sala -->
      <div v-if="!roomStore.currentRoom" class="row justify-center">
        <div class="col-12 col-md-6 col-lg-5">

          <q-card class="create-room-card q-pa-xl fade-in-up">
            <q-card-section class="text-center">
              <div class="text-h5 q-mb-md">Crear una Nueva Sala</div>

              <q-input
                v-model="teacherName"
                label="Tu nombre como profesor"
                outlined
                class="q-mb-md"
              />

              <q-btn
                label="Crear"
                color="primary"
                size="lg"
                class="full-width"
                :loading="creatingRoom"
                @click="createRoom"
              />
            </q-card-section>
          </q-card>

        </div>
      </div>

      <!-- ========================= -->
      <!-- 🟩 Sala activa -->
      <!-- ========================= -->
      <div v-else class="active-room fade-in-up">

        <div class="row q-col-gutter-lg">

          <!-- 🟦 Info de sala -->
          <div class="col-12">
            <q-card class="room-info-card q-pa-md">
              <q-card-section>
                <div class="row items-center">

                  <div class="col">
                    <div class="text-h5">Sala Activa</div>
                    <div class="text-h6 text-primary">
                      ID: <strong>{{ roomStore.currentRoom }}</strong>
                    </div>
                    <div class="text-caption text-grey">
                      Comparte este código con tus estudiantes
                    </div>
                  </div>

                  <div class="col-auto">
                    <q-btn
                      label="Cerrar Sala"
                      color="negative"
                      @click="closeRoom"
                    />
                  </div>

                </div>
              </q-card-section>
            </q-card>
          </div>

          <!-- 🧑‍🎓 Lista de estudiantes -->
          <div class="col-12 col-md-6 col-lg-4">
            <StudentList :students="roomStore.students" />
          </div>

          <!-- 📝 Gestor de Quiz -->
          <div class="col-12 col-md-6 col-lg-4">
            <QuizManager
              :room-id="roomStore.currentRoom"
              :students="roomStore.students"
            />
          </div>

          <!-- 💬 Chat -->
          <div class="col-12 col-lg-4">
            <ChatBox />
          </div>

        </div>

      </div>
    </div>

  </q-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoomStore } from '@/stores/room'
import { useUserStore } from '@/stores/user'
import socketService from '@/services/socket'
import StudentList from '@/components/room/StudentList.vue'
import QuizManager from '@/components/room/QuizManager.vue'
import ChatBox from '@/components/room/ChatBox.vue'

const roomStore = useRoomStore()
const userStore = useUserStore()

const creatingRoom = ref(false)
const teacherName = ref(userStore.user.name)

/* =============================== */
/* 🛰️ Conexiones de sockets */
/* =============================== */
onMounted(() => {
  if (!socketService.isConnected) {
    socketService.connect()
  }

  socketService.on('room-created', (roomId) => {
    roomStore.setRoom(roomId)
    creatingRoom.value = false
  })

  socketService.on('user-joined', (students) => {
    roomStore.updateStudents(students)
  })

  socketService.on('score-update', (students) => {
    roomStore.updateStudents(students)
  })

  socketService.on('questions-updated', (questions) => {
    roomStore.setQuiz(questions)
  })

  socketService.on('quiz-started', (data) => {
    roomStore.setGameState('playing')
    if (data.questions) {
      roomStore.setQuiz(data.questions)
    }
    roomStore.setCurrentQuestionIndex(0)
  })

  socketService.on('quiz-finished', (students) => {
    roomStore.setGameState('finished')
    roomStore.updateStudents(students)
  })

  socketService.on('room-closed', () => {
    roomStore.clearRoom()
  })
})

onUnmounted(() => {
  socketService.off('room-created')
  socketService.off('user-joined')
  socketService.off('score-update')
  socketService.off('questions-updated')
  socketService.off('quiz-started')
  socketService.off('quiz-finished')
  socketService.off('room-closed')
})

const createRoom = () => {
  if (!teacherName.value.trim()) return

  creatingRoom.value = true
  socketService.createRoom(teacherName.value)
}

const closeRoom = () => {
  socketService.closeRoom(roomStore.currentRoom)
  roomStore.clearRoom()
}
</script>

<style scoped>
.teacher-header {
  box-shadow: 0 4px 25px rgba(0,0,0,0.15);

  /* Gradiente azul profesional */
  background: linear-gradient(135deg, var(--q-primary) 0%, #3a6fd8 100%);
}

.return-btn {
  border-radius: 10px;
  padding: 8px 16px;
}

.create-room-card {
  border-radius: 18px;
  box-shadow: 0 8px 25px rgba(0,0,0,0.12);
}

.room-info-card {
  border-radius: 15px;
  box-shadow: 0 6px 18px rgba(0,0,0,0.1);
}

/* Animación suave */
.fade-in-up {
  animation: fadeInUp 0.35s ease;
}

.active-room {
  display: flex;
  flex-direction: column;
}

.active-room .row {
  min-height: 600px;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
