<template>
  <q-layout view="hHh lpR fFf">
    <!-- Side Menu -->
    <q-drawer v-model="rightDrawerOpen" side="right" show-if-above>
      <q-list>
        <q-item clickable v-ripple :to="dashboardUrl">
          <q-item-section>Home</q-item-section>
        </q-item>

        <!-- Menu ini hanya muncul kalau user admin -->
        <q-item v-if="isAdmin" clickable v-ripple to="/user-form">
          <q-item-section>Pendaftaran Guru</q-item-section>
        </q-item>

        <q-separator />

        <!-- Menu ini hanya muncul kalau user guru -->
        <q-item v-if="isAdmin" clickable v-ripple to="/tajwid">
          <q-item-section>Hukum Tajwid</q-item-section>
        </q-item>

        <q-separator />
        

        <q-item clickable v-ripple @click="logout">
          <q-item-section avatar>
            <q-icon name="logout" />
          </q-item-section>
          <q-item-section>Logout</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <!-- Page Content -->
    <q-page-container>
      <router-view />
    </q-page-container>

    <!-- Fixed Footer with Menu -->
    <q-footer elevated class="bg-green-gradient text-white">
      <div class="row no-wrap items-center justify-around q-py-xs">
        <q-btn flat round dense size="md" color="white" icon="home" :to="dashboardUrl" />
        <q-btn
          v-if="!isAdmin"
          flat round dense size="md" color="white" icon="email" :to="inboxUrl"
        />
        <q-btn
          v-if="!isAdmin"
          flat round dense size="md" color="white" icon="wallet" :to="'/donasi'"
        />
        <q-btn
          v-if="isSantri || isGuru"
          flat round dense size="md" color="white" icon="person" :to="'/profile'"
        />
        <q-btn flat round dense size="md" color="white" icon="settings" @click="toggleRightDrawer" />
      </div>
    </q-footer>
  </q-layout>
</template>

<script>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'MainLayout',
  setup() {
    const rightDrawerOpen = ref(false)
    const router = useRouter()

    // Ambil role user dari localStorage
    const role = localStorage.getItem('role')

    // Hitung dashboard URL sesuai role
    const dashboardUrl = computed(() => {
      switch (role) {
        case 'santri':
          return '/dashboardsantri'
        case 'guru':
          return '/dashboardguru'
        case 'admin':
          return '/dashboardadmin'
        default:
          return '/dashboard'
      }
    })

    const inboxUrl = computed(() => {
      switch (role) {
        case 'santri':
          return '/santri-inbox'
        case 'guru':
          return '/guru-inbox'
        case 'admin':
          return '/dashboardadmin' // fallback, tab ini disembunyikan untuk admin
        default:
          return '/santri-inbox'
      }
    })

    const activeTab = computed(() => router.currentRoute.value.path)
    const isAdmin = computed(() => role === 'admin')
    const isGuru = computed(() => role === 'guru')
    const isSantri = computed(() => role === 'santri')

    const toggleRightDrawer = () => {
      rightDrawerOpen.value = !rightDrawerOpen.value
    }

    const logout = () => {
      localStorage.removeItem('token')
      localStorage.removeItem('id')
      localStorage.removeItem('email')
      localStorage.removeItem('role')
      localStorage.removeItem('profile')
      router.push('/')
    }

    return {
      rightDrawerOpen,
      toggleRightDrawer,
      logout,
      isAdmin,
      isGuru,
      isSantri,
      dashboardUrl,
      inboxUrl,
      activeTab
    }
  }
}
</script>
