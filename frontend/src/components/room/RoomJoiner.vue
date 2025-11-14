<template>
  <div class="room-joiner">

    <!-- ========================= -->
    <!-- 🟦 Sección: Unirse a Sala -->
    <!-- ========================= -->
    <div v-if="!roomStore.currentRoom" class="join-room-section flex flex-center">
      <q-card class="join-room-card q-pa-xl">
        <q-card-section class="text-center">

          <!-- Título -->
          <div class="text-h4 text-bold q-mb-md">Unirse a una Sala</div>

          <!-- Subtítulo -->
          <div class="text-subtitle2 q-mb-lg text-grey-7">
            Ingresa tu nombre y el ID proporcionado por tu profesor.
          </div>

          <!-- Input: Nombre -->
          <q-input
            v-model="studentName"
            label="Tu nombre"
            outlined
            dense
            class="q-mb-md"
            :rules="[val => !!val || 'Campo obligatorio']"
          />

          <!-- Input: Room ID -->
          <q-input
            v-model="roomId"
            label="ID de la Sala"
            outlined
            dense
            class="q-mb-lg"
            :rules="[val => !!val || 'Campo obligatorio']"
          />

          <!-- Botón unirse -->
          <q-btn
            label="Unirse"
            color="primary"
            size="lg"
            unelevated
            class="full-width submit-btn"
            @click="joinRoom"
            :loading="joiningRoom"
          />
        </q-card-section>
      </q-card>
    </div>

    <!-- ========================= -->
    <!-- 🟩 Sección: Sala Unida -->
    <!-- ========================= -->
    <div v-else class="joined-room">
      <div class="row q-col-gutter-lg">

        <!-- Columna: Quiz -->
        <div class="col-12 col-md-8">
          <q-card class="room-status-card q-pa-md">

            <!-- Info general -->
            <q-card-section class="text-center">
              <div class="text-h5 text-bold">Conectado a la Sala</div>
              <div class="text-subtitle1 text-primary q-mt-xs">
                ID: {{ roomStore.currentRoom }}
              </div>
            </q-card-section>

            <!-- ===================== -->
            <!-- ⏳ Estado: Esperando -->
            <!-- ===================== -->
            <div
              v-if="roomStore.gameState === 'waiting'"
              class="text-center q-pa-lg waiting-section"
            >
              <q-icon name="fa-regular fa-clock" size="50px" color="grey-6" />

              <div class="text-h6 q-mt-md">Esperando al profesor…</div>
              <div class="text-caption text-grey q-mb-md">
                El quiz comenzará en breve
              </div>

              <!-- Estudiantes conectados -->
              <div v-if="roomStore.students.length > 0" class="q-mt-lg">
                <div class="text-caption text-grey q-mb-xs">
                  Estudiantes conectados:
                </div>

                <div class="row justify-center q-gutter-sm">
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

            <!-- ==================== -->
            <!-- 🧩 Estado: Jugando -->
            <!-- ==================== -->
            <div v-else-if="roomStore.gameState === 'playing'" class="quiz-section q-pa-md">

              <!-- Progreso -->
              <div class="text-h6 text-center q-mb-lg">
                Pregunta {{ currentQuestionIndex + 1 }} / {{ totalQuestions }}
              </div>

              <!-- Pregunta -->
              <div v-if="currentQuestion">
                <div class="question-text text-h6 text-center q-mb-lg">
                  {{ currentQuestion.text }}
                </div>

                <!-- Opciones -->
                <div class="column q-gutter-sm">
                  <q-btn
                    v-for="(option, key) in currentQuestion.options"
                    :key="key"
                    :label="`${key}. ${option}`"
                    color="primary"
                    outline
                    rounded
                    class="option-btn"
                    @click="submitAnswer(key)"
                    :disabled="hasAnswered"
                  />
                </div>

                <!-- Feedback -->
                <div v-if="hasAnswered" class="q-mt-lg text-center">
                  <q-badge
                    :color="isCorrect ? 'positive' : 'negative'"
                    class="q-pa-sm text-subtitle1"
                  >
                    {{ isCorrect ? "✅ ¡Correcto! +10 pts" : "❌ Incorrecto" }}
                  </q-badge>
                </div>
              </div>
            </div>

            <!-- ========================= -->
            <!-- 🏁 Estado: Quiz terminado -->
            <!-- ========================= -->
            <div v-else class="quiz-finished text-center q-pa-xl">
              <q-icon name="fa-solid fa-party-horn" size="60px" color="positive" />

              <div class="text-h5 q-mt-md">¡Quiz Terminado!</div>

              <div class="text-caption text-grey q-mb-md">
                Tu puntuación final: <strong>{{ currentScore }}</strong> puntos
              </div>

              <!-- Leaderboard final -->
              <div class="final-leaderboard q-mt-lg">
                <div class="text-subtitle1 q-mb-sm">Puntuaciones Finales</div>

                <div
                  v-for="(student, index) in sortedStudents"
                  :key="student.id"
                  class="leaderboard-item row items-center q-pa-sm q-mb-sm rounded-borders"
                  :class="{
                    'bg-yellow-2': index === 0,
                    'bg-blue-1': index === 1,
                    'bg-green-1': index === 2,
                    'bg-grey-2': index > 2
                  }"
                >
                  <div class="col text-left">
                    <span class="text-weight-medium">
                      {{ index + 1 }}. {{ student.name }}
                    </span>
                  </div>

                  <div class="col-auto">
                    <q-badge color="primary">{{ student.score }} pts</q-badge>
                  </div>
                </div>
              </div>
            </div>

            <!-- Botón salir -->
            <q-card-actions align="center" class="q-pa-md">
              <q-btn label="Abandonar Sala" color="negative" @click="leaveRoom" />
            </q-card-actions>

          </q-card>
        </div>

        <!-- Columna: Chat -->
        <div class="col-12 col-md-4">
          <ChatBox />
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRoomStore } from "@/stores/room";
import { useUserStore } from "@/stores/user";
import socketService from "@/services/socket";
import ChatBox from "@/components/room/ChatBox.vue";

const roomStore = useRoomStore();
const userStore = useUserStore();

const joiningRoom = ref(false);
const studentName = ref(userStore.user.name);
const roomId = ref("");

const hasAnswered = ref(false);
const isCorrect = ref(false);

const currentQuestion = computed(() => roomStore.quiz[roomStore.currentQuestionIndex]);
const currentQuestionIndex = computed(() => roomStore.currentQuestionIndex);
const totalQuestions = computed(() => roomStore.quiz.length);

const currentScore = computed(() => {
  const student = roomStore.students.find((s) => s.id === userStore.user.id);
  return student ? student.score : 0;
});

const sortedStudents = computed(() => [...roomStore.students].sort((a, b) => b.score - a.score));

/* -----------------------
   Socket listeners
----------------------- */
onMounted(() => {
  if (!socketService.isConnected) socketService.connect();

  socketService.on("joined-room", (roomId) => {
    roomStore.setRoom(roomId);
    joiningRoom.value = false;
  });

  socketService.on("user-joined", (students) => roomStore.updateStudents(students));
  socketService.on("score-update", (students) => roomStore.updateStudents(students));

  socketService.on("new-question", (data) => {
    roomStore.gameState = "playing";
    roomStore.currentQuestionIndex = data.questionNumber - 1;
    hasAnswered.value = false;
    isCorrect.value = false;
  });

  socketService.on("quiz-started", (data) => {
    roomStore.gameState = "playing";
    roomStore.currentQuestionIndex = 0;
    if (data.questions) {
      roomStore.setQuiz(data.questions);
    }
    hasAnswered.value = false;
    isCorrect.value = false;
  });

  socketService.on("answer-feedback", (correct) => (isCorrect.value = correct));

  socketService.on("quiz-finished", (students) => {
    roomStore.gameState = "finished";
    roomStore.updateStudents(students);
  });

  socketService.on("room-closed", () => leaveRoom());

  socketService.on("user-left", (data) =>
    roomStore.updateStudents(data.updatedStudents)
  );
});

onUnmounted(() => {
  socketService.off("joined-room");
  socketService.off("user-joined");
  socketService.off("score-update");
  socketService.off("new-question");
  socketService.off("quiz-started");
  socketService.off("answer-feedback");
  socketService.off("quiz-finished");
  socketService.off("room-closed");
  socketService.off("user-left");
});

/* -----------------------
   Actions
----------------------- */
const joinRoom = () => {
  if (!studentName.value.trim() || !roomId.value.trim()) return;
  joiningRoom.value = true;
  socketService.joinRoom(roomId.value, studentName.value);
};

const leaveRoom = () => {
  roomStore.clearRoom();
};

const submitAnswer = (answer) => {
  if (!roomStore.currentRoom || hasAnswered.value) return;

  socketService.submitAnswer(roomStore.currentRoom, {
    answer,
    timestamp: Date.now(),
  });

  hasAnswered.value = true;
};
</script>

<style scoped>
.join-room-card {
  max-width: 420px;
  width: 100%;
  border-radius: 22px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.12);
}

.room-status-card {
  max-width: 480px;
  width: 100%;
  border-radius: 18px;
}

.submit-btn {
  border-radius: 12px;
}

.option-btn {
  border-radius: 12px;
  padding: 14px;
}

.question-text {
  line-height: 1.5;
}

.final-leaderboard {
  max-height: 250px;
  overflow-y: auto;
}

.leaderboard-item {
  border: 1px solid #dcdcdc;
}

.waiting-section {
  transition: all 0.3s ease;
}
</style>
