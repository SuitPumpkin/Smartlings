<template>
  <q-card class="student-list-card">
    <q-card-section>
      <div class="text-h6">👥 Estudiantes Conectados</div>
      <div class="text-caption text-grey q-mb-md">
        {{ students.length }} estudiante(s) en la sala
      </div>
    </q-card-section>

    <q-card-section class="q-pt-none">
      <div v-if="students.length === 0" class="text-center q-py-lg">
        <q-icon name="fa-regular fa-users" size="xl" color="grey-5" />
        <div class="text-grey q-mt-sm">Esperando estudiantes...</div>
      </div>

      <div v-else class="students-container">
        <div
          v-for="student in sortedStudents"
          :key="student.id"
          class="student-item row items-center q-pa-sm q-mb-sm rounded-borders"
          :class="{ 'bg-blue-1': student.score > 0 }"
        >
          <div class="col">
            <div class="text-weight-medium">{{ student.name }}</div>
            <div class="text-caption text-grey">{{ student.username }}</div>
          </div>
          <div class="col-auto">
            <q-badge color="primary" class="score-badge">
              {{ student.score }} pts
            </q-badge>
          </div>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  students: {
    type: Array,
    default: () => []
  }
})

const sortedStudents = computed(() => {
  return [...props.students].sort((a, b) => b.score - a.score)
})
</script>

<style scoped>
.student-list-card {
  border-radius: 15px;
  height: 100%;
}

.student-item {
  border: 1px solid #e0e0e0;
  transition: all 0.3s ease;
}

.student-item:hover {
  background-color: #f5f5f5;
  transform: translateX(5px);
}

.score-badge {
  font-size: 0.9em;
  padding: 4px 8px;
  border-radius: 10px;
}
</style>
