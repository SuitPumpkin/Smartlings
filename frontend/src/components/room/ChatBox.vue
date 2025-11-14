<template>
  <q-card class="chat-card">
    <q-card-section class="chat-header q-pa-md">
      <div class="text-h6">💬 Chat</div>
      <div class="text-caption text-grey">
        {{ messages.length }} mensaje(s)
      </div>
    </q-card-section>

    <!-- Área de mensajes -->
    <div class="messages-area">
      <q-scroll-area class="messages-container">
        <div v-if="messages.length === 0" class="text-center text-grey q-pa-lg">
          <q-icon name="fa-regular fa-comment" size="lg" />
          <div class="q-mt-sm text-caption">No hay mensajes aún</div>
        </div>

        <div v-else class="q-pa-md">
          <div
            v-for="msg in messages"
            :key="msg.id"
            class="message-item q-mb-md"
            :class="{ 'my-message': isMyMessage(msg) }"
          >
            <div class="message-header">
              <span class="text-weight-medium text-caption">{{ msg.userName }}</span>
              <span class="text-caption text-grey q-ml-xs">
                {{ formatTime(msg.timestamp) }}
              </span>
            </div>
            <div class="message-bubble q-mt-xs">
              {{ msg.text }}
            </div>
          </div>
        </div>

        <div ref="messagesEnd" />
      </q-scroll-area>
    </div>

    <!-- Input para enviar mensaje -->
    <q-card-section class="q-pa-md chat-input">
      <q-input
        v-model="messageText"
        label="Mensaje..."
        outlined
        dense
        @keyup.enter="sendMessage"
      >
        <template v-slot:append>
          <q-btn
            icon="fa-solid fa-paper-plane"
            flat
            dense
            size="sm"
            @click="sendMessage"
            :disable="!messageText.trim()"
          />
        </template>
      </q-input>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import socketService from '@/services/socket'
import { useUserStore } from '@/stores/user'
import { useRoomStore } from '@/stores/room'

const userStore = useUserStore()
const roomStore = useRoomStore()

const messages = ref([])
const messageText = ref('')
const messagesEnd = ref(null)

// ============================
// Computed
// ============================
const isMyMessage = (msg) => {
  return msg.userName === userStore.user.name
}

const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// ============================
// Auto-scroll
// ============================
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesEnd.value) {
      messagesEnd.value.scrollIntoView({ behavior: 'smooth' })
    }
  })
}

watch(messages, () => {
  scrollToBottom()
})

// ============================
// Socket listeners
// ============================
onMounted(() => {
  if (!socketService.isConnected) socketService.connect()

  // Obtener historial de mensajes
  socketService.on('messages-history', (history) => {
    messages.value = Array.isArray(history) ? history : []
    scrollToBottom()
  })

  // Recibir nuevo mensaje
  socketService.on('new-message', (message) => {
    messages.value.push(message)
  })

  // Solicitar historial al conectar - con delay para asegurar que roomStore esté listo
  setTimeout(() => {
    if (roomStore.currentRoom) {
      socketService.getMessages(roomStore.currentRoom)
      console.log(`📥 Solicitando historial para sala: ${roomStore.currentRoom}`)
    }
  }, 100)
})

onUnmounted(() => {
  socketService.off('messages-history')
  socketService.off('new-message')
})

// ============================
// Enviar mensaje
// ============================
const sendMessage = () => {
  if (!messageText.value.trim() || !roomStore.currentRoom) return

  socketService.sendMessage(roomStore.currentRoom, messageText.value)

  messageText.value = ''
}
</script>

<style scoped>
.chat-card {
  border-radius: 15px;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 500px;
}

.chat-header {
  border-bottom: 2px solid #e0e0e0;
  flex-shrink: 0;
}

.messages-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.messages-container {
  flex: 1;
  width: 100%;
}

.chat-input {
  flex-shrink: 0;
  border-top: 1px solid #e0e0e0;
}

.message-item {
  margin-bottom: 12px;
}

.message-item.my-message {
  text-align: right;
}

.message-header {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  font-size: 0.85rem;
}

.message-item.my-message .message-header {
  justify-content: flex-end;
}

.message-bubble {
  background-color: #f0f0f0;
  border-radius: 12px;
  word-wrap: break-word;
  max-width: 90%;
  display: inline-block;
  padding: 8px 12px;
  line-height: 1.4;
  font-size: 0.95rem;
  text-align: left;
}

.message-item.my-message .message-bubble {
  background-color: #1976d2;
  color: white;
  text-align: right;
}

.messages-container::-webkit-scrollbar {
  width: 6px;
}

.messages-container::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.messages-container::-webkit-scrollbar-thumb {
  background: #bdbdbd;
  border-radius: 3px;
}

.messages-container::-webkit-scrollbar-thumb:hover {
  background: #757575;
}
</style>
