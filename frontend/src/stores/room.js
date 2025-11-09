import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useRoomStore = defineStore('room', () => {
  const currentRoom = ref(null)
  const students = ref([])
  const quiz = ref([])
  const gameState = ref('waiting') // waiting, playing, finished
  const currentQuestionIndex = ref(-1)

  const setRoom = (roomId) => {
    currentRoom.value = roomId
  }

  const updateStudents = (newStudents) => {
    students.value = newStudents
  }

  const addQuestion = (question) => {
    quiz.value.push(question)
  }

  const setQuiz = (questions) => {
    quiz.value = questions
  }

  const setGameState = (state) => {
    gameState.value = state
  }

  const setCurrentQuestionIndex = (index) => {
    currentQuestionIndex.value = index
  }

  const clearRoom = () => {
    currentRoom.value = null
    students.value = []
    quiz.value = []
    gameState.value = 'waiting'
    currentQuestionIndex.value = -1
  }

  return {
    currentRoom,
    students,
    quiz,
    gameState,
    currentQuestionIndex,
    setRoom,
    updateStudents,
    addQuestion,
    setQuiz,
    setGameState,
    setCurrentQuestionIndex,
    clearRoom
  }
})
