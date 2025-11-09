import { io } from 'socket.io-client'

class SocketService {
  constructor() {
    this.socket = null
    this.isConnected = false
  }

  connect() {
    this.socket = io('http://localhost:3000')

    this.socket.on('connect', () => {
      this.isConnected = true
      console.log('✅ Conectado al servidor')
    })

    this.socket.on('disconnect', () => {
      this.isConnected = false
      console.log('❌ Desconectado del servidor')
    })

    return this.socket
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  // Emit events
  createRoom(teacherName) {
    this.socket.emit('create-room', teacherName)
  }

  joinRoom(roomId, studentName) {
    this.socket.emit('join-room', roomId, studentName)
  }

  addQuestion(roomId, question) {
    this.socket.emit('add-question', roomId, question)
  }

  startQuiz(roomId) {
    this.socket.emit('start-quiz', roomId)
  }

  nextQuestion(roomId) {
    this.socket.emit('next-question', roomId)
  }

  submitAnswer(roomId, answerData) {
    this.socket.emit('submit-answer', roomId, answerData)
  }

  closeRoom(roomId) {
    this.socket.emit('close-room', roomId)
  }

  // Listen to events
  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback)
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback)
    }
  }
}

export default new SocketService()
