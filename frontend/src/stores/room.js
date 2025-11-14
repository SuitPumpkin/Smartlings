// src/stores/room.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useRoomStore = defineStore('room', () => {
  // estado principal (mantener nombres clásicos para compatibilidad)
  const currentRoom = ref(null)        // usado por muchos componentes
  const roomId = computed({
    get: () => currentRoom.value,
    set: (v) => { currentRoom.value = v }
  })

  const teacherName = ref(null)
  const students = ref([])

  // preguntas: mantener 'quiz' por compatibilidad y añadir 'questions' (alias)
  const quiz = ref([]) // array de preguntas
  const questions = computed({
    get: () => quiz.value,
    set: (v) => { quiz.value = v }
  })

  const currentQuestionIndex = ref(-1)
  const gameState = ref('waiting') // waiting | playing | finished

  // computed helpers
  const currentQuestion = computed(() => {
    if (currentQuestionIndex.value < 0) return null
    return quiz.value[currentQuestionIndex.value] || null
  })
  const totalQuestions = computed(() => quiz.value.length)

  // mutators / acciones
  const setRoom = (id, teacher = null) => {
    currentRoom.value = id
    teacherName.value = teacher ?? teacherName.value
  }

  const updateStudents = (list) => {
    students.value = Array.isArray(list) ? list : []
  }

  const setQuiz = (questionsArray) => {
    quiz.value = Array.isArray(questionsArray) ? questionsArray : []
  }

  const addQuestion = (question) => {
    if (!question || !question.id) return
    // evitar duplicados
    if (!quiz.value.find(q => q.id === question.id)) {
      quiz.value.push(question)
    }
  }

  const removeQuestion = (id) => {
    quiz.value = quiz.value.filter(q => q.id !== id)
  }

  const setCurrentQuestionIndex = (index) => {
    currentQuestionIndex.value = index
  }

  const setGameState = (state) => {
    gameState.value = state
  }

  const clearRoom = () => {
    currentRoom.value = null
    teacherName.value = null
    students.value = []
    quiz.value = []
    currentQuestionIndex.value = -1
    gameState.value = 'waiting'
  }

  return {
    // state
    currentRoom,
    roomId,
    teacherName,
    students,
    quiz,
    questions,
    currentQuestionIndex,
    gameState,

    // computed
    currentQuestion,
    totalQuestions,

    // actions
    setRoom,
    updateStudents,
    setQuiz,
    addQuestion,
    removeQuestion,
    setCurrentQuestionIndex,
    setGameState,
    clearRoom
  }
})
