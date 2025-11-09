<template>
  <q-card class="quiz-manager-card">
    <q-card-section>
      <div class="text-h6">📝 Gestión del Quiz</div>
      <div class="text-caption text-grey">
        Crea y gestiona las preguntas del quiz
      </div>
    </q-card-section>

    <q-card-section class="q-pt-none">
      <!-- Constructor de Preguntas -->
      <div class="q-gutter-y-md">
        <div v-for="(question, index) in localQuestions" :key="question.id" class="question-item q-pa-md rounded-borders bg-grey-2">
          <div class="text-weight-medium">Pregunta {{ index + 1 }}</div>
          <div class="q-mt-sm">{{ question.text }}</div>
          <div class="q-mt-sm">
            <span v-for="(option, key) in question.options" :key="key" class="q-mr-sm">
              <q-badge :color="key === question.correctAnswer ? 'positive' : 'grey'">
                {{ key }}: {{ option }}
              </q-badge>
            </span>
          </div>
          <q-btn
            icon="delete"
            color="negative"
            flat
            round
            size="sm"
            class="absolute-top-right q-ma-xs"
            @click="removeQuestion(index)"
          />
        </div>

        <q-btn
          label="Agregar Pregunta"
          color="primary"
          outline
          class="full-width"
          @click="showAddQuestionDialog = true"
        />

        <div class="row q-col-gutter-sm q-mt-md">
          <div class="col-6">
            <q-btn
              label="Iniciar Quiz"
              color="positive"
              class="full-width"
              :disabled="localQuestions.length === 0"
              @click="startQuiz"
            />
          </div>
          <div class="col-6">
            <q-btn
              label="Siguiente Pregunta"
              color="primary"
              class="full-width"
              @click="nextQuestion"
              :disabled="!isQuizActive"
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
          <q-form @submit="addQuestion" class="q-gutter-md">
            <q-input
              v-model="newQuestion.text"
              label="Texto de la pregunta"
              type="textarea"
              outlined
              :rules="[val => !!val || 'Campo obligatorio']"
            />

            <div class="row q-col-gutter-sm">
              <div class="col-6" v-for="opt in ['A', 'B', 'C', 'D']" :key="opt">
                <q-input
                  v-model="newQuestion.options[opt]"
                  :label="`Opción ${opt}`"
                  outlined
                  :rules="[val => !!val || 'Campo obligatorio']"
                />
              </div>
            </div>

            <q-select
              v-model="newQuestion.correctAnswer"
              :options="correctOptions"
              label="Respuesta correcta"
              outlined
              :rules="[val => !!val || 'Selecciona la respuesta correcta']"
            />
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="primary" @click="cancelQuestion" />
          <q-btn label="Agregar" color="positive" @click="addQuestion" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-card>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoomStore } from '@/stores/room'
import socketService from '@/services/socket'

const roomStore = useRoomStore()
const showAddQuestionDialog = ref(false)
const localQuestions = ref([])

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

const isQuizActive = computed(() => roomStore.gameState === 'playing')

onMounted(() => {
  // Escuchar eventos del quiz
  socketService.on('quiz-started', () => {
    roomStore.gameState = 'playing'
  })

  socketService.on('quiz-finished', () => {
    roomStore.gameState = 'finished'
  })
})

const addQuestion = () => {
  if (!newQuestion.value.text || !newQuestion.value.correctAnswer) {
    return
  }

  // Validar que todas las opciones tengan texto
  for (let key in newQuestion.value.options) {
    if (!newQuestion.value.options[key]) {
      return
    }
  }

  const question = {
    id: Date.now(),
    ...newQuestion.value
  }

  localQuestions.value.push(question)

  // Enviar al servidor
  if (roomStore.currentRoom) {
    socketService.addQuestion(roomStore.currentRoom, question)
  }

  resetNewQuestion()
  showAddQuestionDialog.value = false
}

const removeQuestion = (index) => {
  localQuestions.value.splice(index, 1)
}

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

const startQuiz = () => {
  if (roomStore.currentRoom && localQuestions.value.length > 0) {
    // Primero enviar todas las preguntas al servidor
    localQuestions.value.forEach(question => {
      socketService.addQuestion(roomStore.currentRoom, question)
    })

    // Luego iniciar el quiz
    socketService.startQuiz(roomStore.currentRoom)
  }
}

const nextQuestion = () => {
  if (roomStore.currentRoom) {
    socketService.nextQuestion(roomStore.currentRoom)
  }
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
}
</style>
