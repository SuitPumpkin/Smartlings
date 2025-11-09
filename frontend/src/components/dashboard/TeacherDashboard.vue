<template>
  <q-page class="teacher-dashboard bg-blue-grey-1">
    <!-- Header -->
    <div class="teacher-header bg-primary text-white q-pa-lg">
      <div class="row items-center">
        <div class="col">
          <div class="text-h4">Modo Profesor</div>
          <div class="text-subtitle1">Gestiona tus salas de clase</div>
        </div>
        <div class="col-auto">
          <q-btn
            label="Volver al Dashboard"
            color="white"
            flat
            @click="$router.push('/dashboard')"
          />
        </div>
      </div>
    </div>

    <div class="q-pa-lg">
      <!-- Crear Sala -->
      <div v-if="!roomStore.currentRoom" class="row justify-center">
        <div class="col-12 col-md-6">
          <q-card class="create-room-card q-pa-xl">
            <q-card-section class="text-center">
              <div class="text-h5 q-mb-md">Crear Nueva Sala</div>
              <q-input
                v-model="teacherName"
                label="Tu nombre como profesor"
                outlined
                class="q-mb-md"
              />
              <q-btn
                label="🎯 Crear Sala"
                color="primary"
                size="lg"
                @click="createRoom"
                :loading="creatingRoom"
                class="full-width"
              />
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Sala Activa -->
      <div v-else class="active-room">
        <div class="row q-col-gutter-lg">
          <!-- Información de la Sala -->
          <div class="col-12">
            <q-card class="room-info-card">
              <q-card-section>
                <div class="row items-center">
                  <div class="col">
                    <div class="text-h5">Sala Activa</div>
                    <div class="text-h6 text-primary">
                      ID: <strong>{{ roomStore.currentRoom }}</strong>
                    </div>
                    <div class="text-caption text-grey">
                      Comparte este ID con tus estudiantes
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

          <!-- Lista de Estudiantes -->
          <div class="col-12 col-md-6">
            <StudentList :students="roomStore.students" />
          </div>

          <!-- Gestión del Quiz -->
          <div class="col-12 col-md-6">
            <QuizManager
              :room-id="roomStore.currentRoom"
              :students="roomStore.students"
            />
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

const roomStore = useRoomStore()
const userStore = useUserStore()
const creatingRoom = ref(false)
const teacherName = ref(userStore.user.name)

onMounted(() => {
  // Conectar socket si no está conectado
  if (!socketService.isConnected) {
    socketService.connect()
  }

  // Configurar listeners
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

  socketService.on('room-closed', () => {
    roomStore.clearRoom()
  })
})

onUnmounted(() => {
  // Limpiar listeners
  socketService.off('room-created')
  socketService.off('user-joined')
  socketService.off('score-update')
  socketService.off('room-closed')
})

const createRoom = () => {
  if (!teacherName.value.trim()) {
    return
  }
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
  border-radius: 0 0 30px 30px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

.create-room-card {
  border-radius: 20px;
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
}

.room-info-card {
  border-radius: 15px;
}
</style>
