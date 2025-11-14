<template>
  <q-card class="quiz-manager-card">
    <q-card-section>
      <div class="text-h6">📝 Gestión del Quiz</div>
      <div class="text-caption text-grey">
        Crea y gestiona las preguntas del quiz
      </div>
    </q-card-section>

    <q-card-section class="q-pt-none">
      <div class="q-gutter-y-md">

        <!-- Estado del quiz -->
        <div class="quiz-status q-pa-md bg-blue-1 rounded-borders">
          <div class="text-weight-medium">
            Estado:
            <q-badge
              :color="gameStateColor"
              class="q-ml-sm"
            >
              {{ gameStateLabel }}
            </q-badge>
          </div>
          <div class="text-caption text-grey q-mt-sm">
            {{ roomStore.quiz.length }} pregunta(s) agregada(s)
          </div>
        </div>

        <!-- Lista de preguntas -->
        <div v-if="roomStore.quiz.length === 0" class="text-center q-py-lg">
          <q-icon name="fa-regular fa-list" size="xl" color="grey-5" />
          <div class="text-grey q-mt-sm">No hay preguntas aún</div>
        </div>

        <div
          v-for="(question, index) in roomStore.quiz"
          :key="question.id"
          class="question-item q-pa-md rounded-borders bg-grey-2"
        >
          <div class="row items-start q-gutter-md">
            <div class="col">
              <div class="text-weight-medium">Pregunta {{ index + 1 }}</div>
              <div class="q-mt-sm">{{ question.text }}</div>

              <div class="q-mt-sm row q-gutter-xs flex-wrap">
                <q-badge
                  v-for="(option, key) in question.options"
                  :key="key"
                  :color="key === question.correctAnswer ? 'positive' : 'grey'"
                >
                  {{ key }}: {{ option }}
                </q-badge>
              </div>
            </div>

            <div class="col-auto">
              <q-btn
                icon="fa-solid fa-trash"
                color="negative"
                flat
                round
                size="sm"
                @click="removeQuestion(question.id)"
                v-if="!isQuizActive"
              />
            </div>
          </div>
        </div>

        <!-- Botón agregar pregunta -->
        <q-btn
          label="Agregar Pregunta"
          color="primary"
          outline
          class="full-width"
          @click="showAddQuestionDialog = true"
          :disable="isQuizActive"
        />

        <!-- Botones de quiz -->
        <div class="row q-col-gutter-sm q-mt-md">
          <div class="col-6">
            <q-btn
              label="Iniciar Quiz"
              color="positive"
              class="full-width"
              :disable="roomStore.quiz.length === 0 || isQuizActive"
              @click="startQuiz"
            />
          </div>

          <div class="col-6">
            <q-btn
              label="Siguiente"
              color="primary"
              class="full-width"
              @click="nextQuestion"
              :disable="!isQuizActive"
            />
          </div>
        </div>
      </div>
    </q-card-section>

    <!-- Dialog para agregar pregunta -->
    <q-dialog v-model="showAddQuestionDialog" persistent>
      <q-card style="width: 500px; max-width: 80vw;">
        <q-card-section>
          <div class="text-h6">Agregar Nueva Pregunta</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form ref="formRef" class="q-gutter-md" @submit="addQuestion">

            <q-input
              v-model="newQuestion.text"
              label="Texto de la pregunta"
              type="textarea"
              outlined
              :rules="[v => !!v || 'Campo obligatorio']"
            />

            <div class="row q-col-gutter-sm">
              <div class="col-6" v-for="opt in ['A','B','C','D']" :key="opt">
                <q-input
                  v-model="newQuestion.options[opt]"
                  :label="`Opción ${opt}`"
                  outlined
                  :rules="[v => !!v || 'Campo obligatorio']"
                />
              </div>
            </div>

            <q-select
              v-model="newQuestion.correctAnswer"
              :options="correctOptions"
              label="Respuesta correcta"
              outlined
              :rules="[v => !!v || 'Selecciona la respuesta correcta']"
            />
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="primary" @click="cancelQuestion" />
          <q-btn label="Agregar" color="positive" type="submit" @click="submitForm" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-card>
</template>

<script setup>
import { ref, computed } from 'vue'
import socketService from '@/services/socket'
import { useRoomStore } from '@/stores/room'

const roomStore = useRoomStore()

// UI
const showAddQuestionDialog = ref(false)
const formRef = ref(null)

// Pregunta temporal
const newQuestion = ref({
  text: '',
  options: { A: '', B: '', C: '', D: '' },
  correctAnswer: ''
})

const correctOptions = [
  { label: 'Opción A', value: 'A' },
  { label: 'Opción B', value: 'B' },
  { label: 'Opción C', value: 'C' },
  { label: 'Opción D', value: 'D' }
]

// Estado del quiz
const isQuizActive = computed(() => roomStore.gameState === 'playing')

const gameStateLabel = computed(() => {
  const states = {
    waiting: 'Esperando...',
    playing: 'En progreso',
    finished: 'Terminado'
  }
  return states[roomStore.gameState] || 'Desconocido'
})

const gameStateColor = computed(() => {
  const colors = {
    waiting: 'grey',
    playing: 'positive',
    finished: 'warning'
  }
  return colors[roomStore.gameState] || 'grey'
})

// =============================
//   SOCKET LISTENERS
// =============================

// =============================
//   FUNCIÓN: agregar pregunta
// =============================
const submitForm = () => {
  formRef.value.submit()
}

const addQuestion = () => {
  const question = {
    id: crypto.randomUUID(),
    text: newQuestion.value.text,
    options: { ...newQuestion.value.options },
    correctAnswer: newQuestion.value.correctAnswer
  }

  socketService.addQuestion(roomStore.currentRoom, question)

  resetNewQuestion()
  showAddQuestionDialog.value = false
}

const removeQuestion = (id) => {
  roomStore.removeQuestion(id)
}

// =============================
//   CONTROL DEL QUIZ
// =============================
const startQuiz = () => {
  socketService.startQuiz(roomStore.currentRoom)
}

const nextQuestion = () => {
  socketService.nextQuestion(roomStore.currentRoom)
}

// =============================
//   RESET FORM
// =============================
const resetNewQuestion = () => {
  newQuestion.value = {
    text: '',
    options: { A: '', B: '', C: '', D: '' },
    correctAnswer: ''
  }
}

const cancelQuestion = () => {
  resetNewQuestion()
  showAddQuestionDialog.value = false
}
</script>

<style scoped>
.quiz-manager-card {
  border-radius: 15px;
  height: 100%;
}

.question-item {
  position: relative;
  border: 1px solid #e0e0e0;
  transition: all 0.3s ease;
}

.question-item:hover {
  background-color: #e8eef7;
  border-color: #1976d2;
}

.quiz-status {
  border: 2px solid var(--q-primary);
}
</style>
