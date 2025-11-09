<template>
  <div class="room-joiner">
    <!-- Unirse a Sala -->
    <div v-if="!roomStore.currentRoom" class="join-room-section">
      <q-card class="join-room-card q-pa-xl">
        <q-card-section class="text-center">
          <div class="text-h5 q-mb-md">Unirse a una Sala</div>
          <q-input
            v-model="studentName"
            label="Tu nombre"
            outlined
            class="q-mb-md"
            :rules="[val => !!val || 'Campo obligatorio']"
          />
          <q-input
            v-model="roomId"
            label="ID de la Sala"
            outlined
            class="q-mb-md"
            :rules="[val => !!val || 'Campo obligatorio']"
          />
          <q-btn
            label="🎮 Unirse a la Sala"
            color="primary"
            size="lg"
            @click="joinRoom"
            :loading="joiningRoom"
            class="full-width"
          />
        </q-card-section>
      </q-card>
    </div>

    <!-- Sala Unida -->
    <div v-else class="joined-room">
      <q-card class="room-status-card">
        <q-card-section>
          <div class="text-h6 text-center">Conectado a la Sala</div>
          <div class="text-subtitle1 text-center text-primary">
            ID: {{ roomStore.currentRoom }}
          </div>
        </q-card-section>

        <!-- Estado de espera -->
        <div v-if="roomStore.gameState === 'waiting'" class="text-center q-pa-lg">
          <q-icon name="schedule" size="xl" color="grey-5" />
          <div class="text-h6 q-mt-md">Esperando al profesor...</div>
          <div class="text-caption text-grey">
            El profesor iniciará el quiz pronto
          </div>

          <!-- Mostrar otros estudiantes conectados -->
          <div v-if="roomStore.students.length > 0" class="q-mt-lg">
            <div class="text-caption text-grey q-mb-sm">
              Estudiantes conectados:
            </div>
            <div class="row justify-center q-gutter-xs">
              <q-badge
                v-for="student in roomStore.students"
                :key="student.id"
                color="secondary"
                class="q-pa-sm"
              >
                {{ student.name }}
              </q-badge>
            </div>
          </div>
        </div>

        <!-- Durante el quiz -->
        <div v-else-if="roomStore.gameState === 'playing'" class="quiz-section">
          <div class="text-h6 text-center">
            Pregunta {{ currentQuestionIndex + 1 }} de {{ totalQuestions }}
          </div>

          <div v-if="currentQuestion" class="q-pa-md">
            <div class="question-text text-h6 q-mb-md text-center">
              {{ currentQuestion.text }}
            </div>

            <div class="options-grid">
              <q-btn
                v-for="(option, key) in currentQuestion.options"
                :key="key"
                :label="`${key}. ${option}`"
                color="primary"
                outline
                class="option-btn full-width q-mb-sm"
                @click="submitAnswer(key)"
                :disabled="hasAnswered"
              />
            </div>

            <div v-if="hasAnswered" class="answer-feedback q-mt-md text-center">
              <q-badge :color="isCorrect ? 'positive' : 'negative'" class="q-pa-sm">
                {{ isCorrect ? '✅ Correcto! +10 puntos' : '❌ Incorrecto' }}
              </q-badge>
            </div>
          </div>
        </div>

        <!-- Quiz terminado -->
        <div v-else class="quiz-finished text-center q-pa-lg">
          <q-icon name="celebration" size="xl" color="positive" />
          <div class="text-h6 q-mt-md">¡Quiz Terminado!</div>
          <div class="text-caption text-grey q-mb-md">
            Tu puntuación final: {{ currentScore }} puntos
          </div>

          <!-- Leaderboard final -->
          <div class="final-leaderboard q-mt-md">
            <div class="text-subtitle2 q-mb-sm">Puntuaciones Finales:</div>
            <div
              v-for="(student, index) in sortedStudents"
              :key="student.id"
              class="leaderboard-item row items-center q-pa-sm q-mb-xs rounded-borders"
              :class="{
                'bg-yellow-2': index === 0,
                'bg-blue-1': index === 1,
                'bg-green-1': index === 2,
                'bg-grey-2': index > 2
              }"
            >
              <div class="col">
                <div class="text-weight-medium">
                  {{ index + 1 }}. {{ student.name }}
                </div>
              </div>
              <div class="col-auto">
                <q-badge color="primary">
                  {{ student.score }} pts
                </q-badge>
              </div>
            </div>
          </div>
        </div>

        <q-card-actions align="center" class="q-pa-md">
          <q-btn
            label="Abandonar Sala"
            color="negative"
            @click="leaveRoom"
          />
        </q-card-actions>
      </q-card>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoomStore } from '@/stores/room'
import { useUserStore } from '@/stores/user'
import socketService from '@/services/socket'

const roomStore = useRoomStore()
const userStore = useUserStore()

const joiningRoom = ref(false)
const studentName = ref(userStore.user.name)
const roomId = ref('')
const hasAnswered = ref(false)
const isCorrect = ref(false)

const currentQuestion = computed(() => {
  return roomStore.quiz[roomStore.currentQuestionIndex]
})

const currentQuestionIndex = computed(() => roomStore.currentQuestionIndex)
const totalQuestions = computed(() => roomStore.quiz.length)

const currentScore = computed(() => {
  const student = roomStore.students.find(s => s.id === userStore.user.id)
  return student ? student.score : 0
})

const sortedStudents = computed(() => {
  return [...roomStore.students].sort((a, b) => b.score - a.score)
})

onMounted(() => {
  if (!socketService.isConnected) {
    socketService.connect()
  }

  // Configurar listeners
  socketService.on('joined-room', (roomId) => {
    roomStore.setRoom(roomId)
    joiningRoom.value = false
  })

  socketService.on('user-joined', (students) => {
    roomStore.updateStudents(students)
  })

  socketService.on('score-update', (students) => {
    roomStore.updateStudents(students)
  })

  socketService.on('new-question', (data) => {
    roomStore.gameState = 'playing'
    roomStore.currentQuestionIndex = data.questionNumber - 1
    hasAnswered.value = false
    isCorrect.value = false
  })

  socketService.on('quiz-started', (data) => {
    roomStore.gameState = 'playing'
    roomStore.currentQuestionIndex = 0
    roomStore.quiz = data.questions || []
  })

  socketService.on('answer-feedback', (correct) => {
    isCorrect.value = correct
  })

  socketService.on('quiz-finished', (students) => {
    roomStore.gameState = 'finished'
    roomStore.updateStudents(students)
  })

  socketService.on('room-closed', () => {
    leaveRoom()
  })

  socketService.on('user-left', (data) => {
    roomStore.updateStudents(data.updatedStudents)
  })
})

onUnmounted(() => {
  // Limpiar listeners
  socketService.off('joined-room')
  socketService.off('user-joined')
  socketService.off('score-update')
  socketService.off('new-question')
  socketService.off('quiz-started')
  socketService.off('answer-feedback')
  socketService.off('quiz-finished')
  socketService.off('room-closed')
  socketService.off('user-left')
})

const joinRoom = () => {
  if (!studentName.value.trim() || !roomId.value.trim()) {
    return
  }
  joiningRoom.value = true
  socketService.joinRoom(roomId.value, studentName.value)
}

const leaveRoom = () => {
  roomStore.clearRoom()
}

const submitAnswer = (answer) => {
  if (!roomStore.currentRoom || hasAnswered.value) {
    return
  }

  socketService.submitAnswer(roomStore.currentRoom, {
    answer: answer,
    timestamp: Date.now()
  })

  hasAnswered.value = true
}
</script>

<style scoped>
.join-room-card {
  border-radius: 20px;
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
}

.room-status-card {
  border-radius: 15px;
}

.option-btn {
  border-radius: 10px;
  padding: 12px;
}

.question-text {
  line-height: 1.4;
}

.quiz-finished {
  border-top: 1px solid #e0e0e0;
}

.leaderboard-item {
  border: 1px solid #e0e0e0;
}

.final-leaderboard {
  max-height: 300px;
  overflow-y: auto;
}
</style>
