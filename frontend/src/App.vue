<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-toolbar-title class="text-weight-bold">
          🎮 SMARTLINGS
        </q-toolbar-title>

        <div v-if="userStore.isAuthenticated" class="row items-center q-gutter-sm">
          <q-avatar color="secondary" text-color="white" size="md">
            {{ userStore.user.name.charAt(0) }}
          </q-avatar>
          <div class="text-caption">
            {{ userStore.user.name }}
          </div>
          <q-btn
            flat
            round
            icon="logout"
            @click="handleLogout"
          >
            <q-tooltip>
              Cerrar sesión
            </q-tooltip>
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()

const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}
</script>
