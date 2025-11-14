// src/services/socketService.js
import { io } from 'socket.io-client'

class SocketService {
  constructor() {
    this.socket = null
    this.isConnected = false
  }

  /**
   * Inicializa la conexión al servidor Socket.IO
   */
  connect() {
    if (this.socket) {
      console.warn("⚠️ Socket ya estaba conectado, reusando instancia...")
      return this.socket
    }

    this.socket = io('http://localhost:3000', {
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5
    })

    this.socket.on('connect', () => {
      this.isConnected = true
      console.log('✅ Conectado al servidor WebSocket')
    })

    this.socket.on('disconnect', () => {
      this.isConnected = false
      console.log('❌ Desconectado del servidor WebSocket')
    })

    return this.socket
  }

  /**
   * Desconecta el socket y limpia la instancia
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.isConnected = false
      console.log("🔌 Socket desconectado manualmente")
    }
  }

  /**
   * Emitir eventos de forma segura
   */
  emit(event, ...args) {
    if (!this.socket || !this.isConnected) {
      console.error(`🚫 No se puede emitir "${event}", socket no conectado.`)
      return
    }
    this.socket.emit(event, ...args)
  }

  /**
   * Registrar listeners (evitando registrar duplicados)
   */
  on(event, callback) {
    if (!this.socket) return

    this.socket.off(event) // prevenir duplicados
    this.socket.on(event, callback)
  }

  /**
   * Remover listeners
   */
  off(event) {
    if (!this.socket) return
    this.socket.off(event)
  }

  // ================================
  // Eventos de sala
  // ================================

  createRoom(teacherName) {
    this.emit('create-room', teacherName)
  }

  joinRoom(roomId, studentName) {
    this.emit('join-room', roomId, studentName)
  }

  addQuestion(roomId, question) {
    this.emit('add-question', roomId, question)
  }

  startQuiz(roomId) {
    this.emit('start-quiz', roomId)
  }

  nextQuestion(roomId) {
    this.emit('next-question', roomId)
  }

  submitAnswer(roomId, answerData) {
    this.emit('submit-answer', roomId, answerData)
  }

  closeRoom(roomId) {
    this.emit('close-room', roomId)
  }
}

export default new SocketService()
