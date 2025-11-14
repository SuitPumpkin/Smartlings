<template>
  <q-layout view="lHh Lpr fFf">

    <!-- HEADER Smartlings (solo si está logueado) -->
    <q-header
      v-if="userStore.isAuthenticated"
      class="smartlings-header"
      elevated
    >
      <q-toolbar>

        <!-- Branding -->
        <div class="row items-center">
          <img src="/smartlings.png" alt="Smartlings" class="header-logo" />
        </div>

        <q-space />

        <!-- Usuario -->
        <div class="row items-center q-gutter-sm">
          <q-avatar class="user-avatar">
            {{ userInitials }}
          </q-avatar>

          <div class="user-name">
            {{ userStore.user.name }}
          </div>

          <q-btn
            flat
            round
            icon="fa-solid fa-right-from-bracket"
            class="logout-btn"
            @click="handleLogout"
          >
            <q-tooltip>Cerrar sesión</q-tooltip>
          </q-btn>
        </div>

      </q-toolbar>
    </q-header>

    <!-- CONTENIDO DE LA APP -->
    <q-page-container>
      <router-view />
    </q-page-container>

  </q-layout>
</template>

<script setup>
import { computed } from "vue";
import { useUserStore } from "@/stores/user";
import { useRouter } from "vue-router";

const userStore = useUserStore();
const router = useRouter();

const userInitials = computed(() =>
  userStore.user?.name ? userStore.user.name.charAt(0).toUpperCase() : "?"
);

const handleLogout = () => {
  userStore.logout();
  router.push("/login");
};
</script>

<style scoped>
/* === Header Pastel Smartlings === */

.smartlings-header {
  background: #ffffff;
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  padding-bottom: 6px;
}

.header-logo {
  width: 100px;
  margin-right: 10px;
}

/* Usuario */
.user-avatar {
  background: #ff9eb4; /* Rosa pastel */
  color: white;
  font-weight: bold;
}

.user-name {
  font-size: 14px;
  color: #444;
  font-weight: 500;
}

.logout-btn {
  color: #ff6f91;
}
</style>
