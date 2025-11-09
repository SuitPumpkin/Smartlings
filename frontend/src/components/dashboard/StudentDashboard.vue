<template>
  <q-page class="student-dashboard bg-blue-grey-1">
    <!-- Header -->
    <div class="student-header bg-primary text-white q-pa-lg">
      <div class="row items-center">
        <div class="col">
          <div class="text-h4">Modo Estudiante</div>
          <div class="text-subtitle1">Únete a sesiones interactivas</div>
        </div>
        <div class="col-auto">
          <q-btn
            label="Volver al Dashboard"
            color="white"
            flat
            @click="$router.push('/dashboard')"
          />
        </div>
      </div>
    </div>

    <div class="q-pa-lg">
      <div class="row justify-center">
        <div class="col-12 col-md-6">
          <RoomJoiner />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import RoomJoiner from '@/components/room/RoomJoiner.vue'
</script>

<style scoped>
.student-header {
  border-radius: 0 0 30px 30px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}
</style>
