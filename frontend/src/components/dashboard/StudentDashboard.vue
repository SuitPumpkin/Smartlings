<template>
  <q-page class="student-dashboard bg-blue-grey-1">

    <!-- ========================= -->
    <!-- 🔵 Header Estético -->
    <!-- ========================= -->
    <div class="student-header text-white q-pa-xl">
      <div class="row items-center">
        <div class="col">

          <div class="text-h4 text-bold">Salas</div>

          <div class="text-subtitle1 text-white opacity-80">
            Únete a sesiones interactivas y aprende en tiempo real
          </div>

        </div>

        <div class="col-auto">
          <q-btn
            label="Volver al Dashboard"
            color="white"
            text-color="primary"
            unelevated
            class="return-btn"
            @click="$router.push('/dashboard')"
          />
        </div>
      </div>
    </div>

    <!-- ========================= -->
    <!-- 🟦 Contenido -->
    <!-- ========================= -->
    <div class="q-pa-xl">
      <div class="row justify-center">
        <div class="col-12 col-md-6 col-lg-5">

          <div class="card-wrapper q-pa-md">
            <RoomJoiner />
          </div>

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
  box-shadow: 0 4px 25px rgba(0,0,0,0.15);

  /* Gradiente sutil */
  background: linear-gradient(135deg, var(--q-primary) 0%, #3a6fd8 100%);
}

.card-wrapper {
  animation: fadeInUp 0.35s ease;
}

.return-btn {
  border-radius: 10px;
  padding: 8px 16px;
}

/* Animación suave */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
