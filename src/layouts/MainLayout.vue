<template>
  <q-layout view="hHh LpR lFf">
    <!-- ============ SIDEBAR KIRI (DESKTOP ≥ lg) ============ -->
    <q-drawer
      v-model="leftDrawerOpen"
      side="left"
      show-if-above
      :breakpoint="1024"
      bordered
      class="bg-serene-surface serene-sidebar"
    >
      <div class="column full-height q-pa-md">
        <!-- Brand -->
        <div class="q-px-md q-mb-lg q-mt-sm">
          <div class="headline-font text-h6 text-serene-primary text-weight-bold">Serene Path</div>
          <div class="text-caption text-serene-variant">Student Portal</div>
        </div>

        <!-- Nav -->
        <q-list class="rounded-borders">
          <q-item
            clickable v-ripple :to="dashboardUrl"
            :active="isActive(dashboardUrl)"
            active-class="serene-nav-active"
          >
            <q-item-section avatar><q-icon name="dashboard" /></q-item-section>
            <q-item-section>Beranda</q-item-section>
          </q-item>

          <q-item
            clickable v-ripple :to="learnUrl"
            :active="isActive(learnUrl)"
            active-class="serene-nav-active"
          >
            <q-item-section avatar><q-icon name="auto_stories" /></q-item-section>
            <q-item-section>Belajar</q-item-section>
          </q-item>

          <q-item
            v-if="isSantri || isGuru"
            clickable v-ripple to="/profile"
            :active="isActive('/profile')"
            active-class="serene-nav-active"
          >
            <q-item-section avatar><q-icon name="person" /></q-item-section>
            <q-item-section>Profil</q-item-section>
          </q-item>

          <q-item
            v-if="isSantri || isGuru"
            clickable v-ripple to="/settings"
            :active="isActive('/settings')"
            active-class="serene-nav-active"
          >
            <q-item-section avatar><q-icon name="settings" /></q-item-section>
            <q-item-section>Settings</q-item-section>
          </q-item>

          <template v-if="isAdmin">
            <q-separator class="q-my-sm" />
            <q-item clickable v-ripple to="/user-form">
              <q-item-section avatar><q-icon name="person_add" /></q-item-section>
              <q-item-section>Pendaftaran Guru</q-item-section>
            </q-item>
            <q-item clickable v-ripple to="/tajwid">
              <q-item-section avatar><q-icon name="menu_book" /></q-item-section>
              <q-item-section>Hukum Tajwid</q-item-section>
            </q-item>
          </template>

          <q-separator class="q-my-sm" />
          <q-item clickable v-ripple @click="logout">
            <q-item-section avatar><q-icon name="logout" /></q-item-section>
            <q-item-section>Logout</q-item-section>
          </q-item>
        </q-list>

        <!-- User chip bawah -->
        <div class="q-mt-auto serene-card q-pa-sm row items-center q-gutter-sm">
          <q-avatar size="36px" class="bg-serene-primary text-white text-weight-bold">
            {{ initial }}
          </q-avatar>
          <div class="col">
            <div class="text-caption text-weight-bold ellipsis">{{ displayName }}</div>
            <div class="text-caption text-serene-variant" style="font-size:10px;">Level Scholar</div>
          </div>
        </div>
      </div>
    </q-drawer>

    <!-- ============ TOP BAR ============ -->
    <q-header class="bg-serene text-serene-on-surface" elevated>
      <q-toolbar>
        <!-- Hamburger (mobile) -->
        <q-btn
          flat round dense icon="menu" class="lt-lg"
          @click="leftDrawerOpen = !leftDrawerOpen"
        />
        <q-space />

        <!-- Search pill (desktop) -->
        <q-input
          dense
          outlined
          rounded
          placeholder="Cari materi tajwid..."
          class="serene-topbar-search gt-sm"
          style="width:320px;"
          bg-color="white"
        >
          <template v-slot:prepend>
            <q-icon name="search" color="serene-variant" />
          </template>
        </q-input>

        <q-space />

        <q-btn flat round dense icon="notifications" class="text-serene-variant" />
        <q-btn flat round dense icon="help" class="text-serene-variant" />
        <q-avatar size="32px" class="q-ml-sm">
          <img v-if="avatarUrl" :src="avatarUrl" />
          <div v-else class="bg-serene-primary text-white text-weight-bold full-height flex flex-center">
            {{ initial }}
          </div>
        </q-avatar>
      </q-toolbar>
    </q-header>

    <!-- ============ MAIN CONTENT ============ -->
    <q-page-container>
      <div class="main-container q-mx-auto">
        <router-view />
      </div>
    </q-page-container>

    <!-- ============ BOTTOM NAV (MOBILE < lg) ============ -->
    <q-footer elevated class="bg-serene text-serene-primary lt-lg">
      <div class="row no-wrap items-center justify-around q-py-xs">
        <q-btn flat round dense size="md" icon="home" :to="dashboardUrl" />
        <q-btn v-if="!isAdmin" flat round dense size="md" icon="email" :to="inboxUrl" />
        <q-btn v-if="!isAdmin" flat round dense size="md" icon="wallet" :to="'/donasi'" />
        <q-btn v-if="isSantri || isGuru" flat round dense size="md" icon="person" :to="'/profile'" />
        <q-btn flat round dense size="md" icon="settings" :to="'/settings'" />
      </div>
    </q-footer>
  </q-layout>
</template>

<script>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'MainLayout',
  setup () {
    const leftDrawerOpen = ref(false)
    const router = useRouter()

    const role = localStorage.getItem('role')
    const displayName = localStorage.getItem('displayName') || localStorage.getItem('email') || 'User'
    const avatarUrl = localStorage.getItem('avatar') || ''
    const initial = (displayName || 'U').charAt(0).toUpperCase()

    const dashboardUrl = computed(() => {
      switch (role) {
        case 'santri': return '/dashboardsantri'
        case 'guru': return '/dashboardguru'
        case 'admin': return '/dashboardadmin'
        default: return '/dashboard'
      }
    })
    const learnUrl = computed(() => {
      switch (role) {
        case 'santri': return '/tajwid'
        case 'guru': return '/tajwid'
        case 'admin': return '/tajwid'
        default: return '/tajwid'
      }
    })
    const inboxUrl = computed(() => {
      switch (role) {
        case 'santri': return '/santri-inbox'
        case 'guru': return '/guru-inbox'
        default: return '/santri-inbox'
      }
    })

    const isAdmin = computed(() => role === 'admin')
    const isGuru = computed(() => role === 'guru')
    const isSantri = computed(() => role === 'santri')

    const isActive = (path) => router.currentRoute.value.path === path

    const logout = () => {
      localStorage.removeItem('token')
      localStorage.removeItem('id')
      localStorage.removeItem('email')
      localStorage.removeItem('role')
      localStorage.removeItem('profile')
      localStorage.removeItem('displayName')
      localStorage.removeItem('avatar')
      router.push('/')
    }

    return {
      leftDrawerOpen,
      dashboardUrl, learnUrl, inboxUrl,
      isAdmin, isGuru, isSantri,
      displayName, avatarUrl, initial,
      isActive, logout
    }
  }
}
</script>

<style scoped>
.main-container {
  max-width: 1280px;
  padding: 24px;
}
.serene-sidebar {
  width: 256px;
}
.serene-nav-active {
  background: var(--serene-primary-container);
  color: var(--serene-on-primary-container);
  border-radius: 12px;
}
@media (max-width: 1023px) {
  .main-container { padding: 16px; }
}
</style>
