<template>
  <q-page class="dashboard-page">

    <!-- Bienvenida estilo prototipo -->
    <div class="welcome-container text-center">
      <img src="/duo.gif" alt="Smartlings" class="welcome-logo" />

      <div class="welcome-title">
        ¡Hola, {{ userStore.user.name }}! 👋
      </div>

      <div class="welcome-subtitle">
        {{ userStore.isTeacher ? "Profesor" : "Estudiante" }} · {{ userStore.user.username }}
      </div>
    </div>

    <!-- Acción principal -->
    <div class="action-wrapper q-mt-xl text-center">
      <q-btn
        :label="userStore.isTeacher ? 'Crear Sala de Clase' : 'Unirse a una Sesión'"
        class="primary-action"
        @click="handleAction"
      />
      <p class="action-caption">
        {{ userStore.isTeacher
          ? "Inicia una nueva sesión interactiva"
          : "Participa en actividades en vivo" }}
      </p>
    </div>

    <!-- Contenido temático -->
    <div class="content-section q-mt-xl">
      <div class="section-title text-center">Contenido Temático 📚</div>

      <div class="row q-col-gutter-lg q-mt-md justify-center">
        <div
          class="col-12 col-sm-6 col-md-4"
          v-for="item in sections"
          :key="item.id"
        >
          <q-card class="theme-card cursor-pointer" @click="openSection(item.id)">
            <q-card-section class="text-center q-pa-lg">
              <div class="theme-icon">{{ item.icon }}</div>
              <div class="theme-title">{{ item.title }}</div>
              <div class="theme-sub">{{ item.desc }}</div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <!-- Dialog -->
    <q-dialog v-model="showSectionDialog">
      <q-card style="width: 480px; max-width: 90vw;">
        <q-card-section>
          <div class="text-h6">{{ currentSectionTitle }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <p class="text-body1">
            Contenido de {{ currentSectionTitle }} en desarrollo...
          </p>
          <p class="q-mt-md">
            Próximamente tendrás acceso a lecciones interactivas, ejercicios
            gamificados y mucho más sobre este tema.
          </p>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cerrar" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>


<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/user";

const router = useRouter();
const userStore = useUserStore();

const showSectionDialog = ref(false);
const currentSection = ref("");

const sections = [
  {
    id: "matematicas",
    icon: "🔢",
    title: "Matemáticas",
    desc: "Álgebra, geometría y cálculo",
  },
  {
    id: "ciencias",
    icon: "🧪",
    title: "Ciencias",
    desc: "Física, química y biología",
  },
  {
    id: "historia",
    icon: "📜",
    title: "Historia",
    desc: "Eventos históricos y cultura",
  },
];

const currentSectionTitle = computed(() => {
  const titles = {
    matematicas: "Matemáticas",
    ciencias: "Ciencias",
    historia: "Historia",
  };
  return titles[currentSection.value] || "Contenido";
});

const handleAction = () => {
  if (userStore.isTeacher) router.push("/teacher");
  else router.push("/student");
};

const openSection = (section) => {
  currentSection.value = section;
  showSectionDialog.value = true;
};
</script>


<style scoped>
/* Fondo pastel Smartlings */
.dashboard-page {
  background: #f8f6f9;
  min-height: 100vh;
}

/* Bienvenida estilo prototipo */
.welcome-container {
  padding-top: 40px;
  padding-bottom: 10px;
}

.welcome-logo {
  width: 320px;
  margin-bottom: 12px;
}

.welcome-title {
  font-size: 26px;
  font-weight: 700;
  color: #333;
  margin-bottom: 4px;
}

.welcome-subtitle {
  font-size: 14px;
  color: #777;
}

/* Acción principal */
.primary-action {
  background: #ff6f91;
  color: white;
  padding: 14px 26px;
  font-size: 18px;
  border-radius: 30px;
  box-shadow: 0 8px 24px rgba(255, 111, 145, 0.3);
  transition: 0.2s ease;
}

.primary-action:hover {
  transform: translateY(-3px);
}

.action-caption {
  font-size: 13px;
  color: #888;
  margin-top: 8px;
}

/* Título del contenido */
.section-title {
  font-size: 22px;
  font-weight: 600;
  color: #333;
}

/* Tarjetas temáticas */
.theme-card {
  background: white;
  border-radius: 22px;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.08);
  transition: 0.2s ease;
}

.theme-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.12);
}

.theme-icon {
  font-size: 42px;
  margin-bottom: 10px;
}

.theme-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.theme-sub {
  font-size: 13px;
  color: #777;
}
</style>
