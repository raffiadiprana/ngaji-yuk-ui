<template>
  <div class="kurikulum-page q-pa-md">
    <div class="kurikulum-container">
      <!-- Header -->
      <header class="kurikulum-header q-mb-lg">
        <div>
          <h1 class="headline-font kurikulum-title">Kurikulum Tajwid</h1>
          <p class="text-serene-variant">Ikuti perjalanan belajarmu melewati setiap checkpoint hukum tajwid.</p>
        </div>
        <q-btn
          v-if="isGuru || isAdmin"
          class="serene-btn-primary"
          label="Tambah Hukum Tajwid"
          icon="add"
          rounded
          @click="onAddTajwid"
        />
      </header>

      <!-- Progress Overview -->
      <section class="serene-card-soft kurikulum-progress q-mb-lg">
        <div class="row items-center justify-between q-mb-sm">
          <span class="text-serene-variant text-caption">Progres Keseluruhan</span>
          <span class="text-weight-bold text-serene-primary">{{ overallProgress }}%</span>
        </div>
        <q-linear-progress
          :value="overallProgress / 100"
          color="serene-primary"
          class="progress-glow rounded-borders"
          style="height:10px;"
        />
        <div class="row q-gutter-md q-pt-sm text-caption text-serene-variant">
          <span>{{ completedCount }} Selesai</span>
          <span>{{ sections.length - completedCount }} Tersisa</span>
        </div>
      </section>

      <!-- Roadmap Checkpoints -->
      <section class="roadmap">
        <div
          v-for="(tajwid, idx) in sections"
          :key="tajwid.id"
          class="roadmap-node"
          :class="nodeStatus(tajwid).cls"
        >
          <div class="roadmap-marker">
            <q-icon :name="nodeStatus(tajwid).icon" size="22px" />
          </div>
          <q-card
            class="serene-card roadmap-card interactive hover-lift"
            @click="onNodeClick(tajwid)"
          >
            <div class="row items-center no-wrap">
              <q-avatar size="48px" class="roadmap-avatar flex flex-center bg-serene-surface text-serene-primary">
                {{ tajwid.section_name.charAt(0).toUpperCase() }}
              </q-avatar>
              <div class="col q-ml-md min-width-0">
                <div class="row items-center justify-between">
                  <div class="text-weight-bold text-serene-on-surface text-subtitle1 ellipsis">{{ tajwid.section_name }}</div>
                  <q-chip
                    v-if="nodeStatus(tajwid).label"
                    :color="nodeStatus(tajwid).chipColor"
                    text-color="white"
                    size="sm"
                    class="q-ml-sm"
                  >{{ nodeStatus(tajwid).label }}</q-chip>
                </div>
                <div class="text-caption text-serene-variant q-mt-xs">Hukum Tajwid · Checkpoint {{ idx + 1 }}</div>
              </div>
              <q-btn v-if="isGuru || isAdmin" flat round dense icon="more_vert" @click.stop class="q-ml-sm">
                <q-menu auto-close>
                  <q-list style="min-width: 140px;">
                      <q-item v-if="isGuru || isAdmin" clickable @click="editTajwid(tajwid)" class="text-serene-primary">
                      <q-item-section avatar><q-icon name="edit" /></q-item-section>
                      <q-item-section>Edit</q-item-section>
                    </q-item>
                    <q-item v-if="isGuru || isAdmin" clickable @click="deleteTajwid(tajwid)" class="text-negative">
                      <q-item-section avatar><q-icon name="delete" /></q-item-section>
                      <q-item-section>Delete</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </div>
          </q-card>
        </div>
        <div v-if="!sections.length" class="text-center text-serene-variant q-py-lg">
          Belum ada hukum tajwid.
        </div>
      </section>

      <!-- Load More -->
      <q-btn
        v-if="hasMoreGuru"
        label="Tampilkan lebih banyak"
        outline
        class="serene-btn-ghost full-width q-mt-md"
        @click="loadMoreCourses"
        :loading="loadingGuru"
      />
      <p v-else class="text-grey-6 text-center q-mt-md">Tidak ada data lagi</p>
    </div>
  </div>
</template>

<script setup>
import { useQuasar } from 'quasar'
const $q = useQuasar()
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import api from 'src/config/api'
import { authHeader } from 'src/config/auth'

const router = useRouter()

const profile = ref({})
const sections = ref([])
const quizzes = ref([])
const lessons = ref([])
const accessToken = localStorage.getItem('token')
const instructorId = localStorage.getItem('id')

const role = localStorage.getItem('role')
const isGuru = computed(() => role === 'guru' || role === 'admin')
const isAdmin = computed(() => role === 'admin')

const completedCount = ref(0)
const overallProgress = computed(() => {
  if (!sections.value.length) return 0
  return Math.round((completedCount.value / sections.value.length) * 100)
})

const nodeStatus = (tajwid) => {
  // Placeholder status: sebagian besar "available", pertama "in-progress"
  const idx = sections.value.indexOf(tajwid)
  if (idx === 0) return { cls: 'is-active', icon: 'play_circle', label: 'Berlangsung', chipColor: 'serene-primary' }
  if (idx < completedCount.value) return { cls: 'is-done', icon: 'check_circle', label: 'Selesai', chipColor: 'serene-secondary' }
  return { cls: 'is-todo', icon: 'radio_button_unchecked', label: '', chipColor: 'grey' }
}

const skipGurus = ref(0)
const limitGurus = 10
const loadingGuru = ref(false)
const hasMoreGuru = ref(true)

onMounted(async () => {
  const profileData = localStorage.getItem('profile')
  if (profileData) {
    try { profile.value = JSON.parse(profileData) } catch (e) { console.error(e) }
  }
  await fetchSection()
})

const fetchSection = async () => {
  if (loadingGuru.value) return
  loadingGuru.value = true
  try {
    const res = await axios.get(`${api.API_BASE_URL}/sections`, { headers: authHeader() })
    const fetched = res.data.data || []
    if (fetched.length) sections.value.push(...fetched)
    hasMoreGuru.value = fetched.length === limitGurus
    // Demo: anggap 1 selesai
    completedCount.value = Math.min(1, sections.value.length)
  } catch (err) {
    console.error('Failed to fetch sections:', err)
  } finally {
    loadingGuru.value = false
  }
}

const loadMoreCourses = () => {
  if (!loadingGuru.value && hasMoreGuru.value) {
    skipGurus.value += limitGurus
    fetchSection()
  }
}

const onAddTajwid = () => router.push('/tajwid-form')
const editTajwid = (tajwid) => router.push(`/tajwid-form/${tajwid.id}`)

// Klik node roadmap: santri diarahkan ke materi (module) pertama section itu.
// Guru/Admin tetap ke form edit nama hukum tajwid.
const onNodeClick = async (tajwid) => {
  if (isGuru.value || isAdmin.value) {
    editTajwid(tajwid)
    return
  }
  try {
    const res = await axios.get(`${api.API_BASE_URL}/modules`, {
      headers: authHeader(),
      params: { section_id: tajwid.id, is_deleted: 0 }
    })
    const mods = res.data?.data ?? []
    if (mods.length) {
      router.push(`/module/${mods[0].id}`)
    } else {
      $q.notify({ type: 'info', message: 'Belum ada materi untuk hukum tajwid ini.' })
    }
  } catch (e) {
    console.error('[TajwidPage] gagal ambil modules section:', e)
    $q.notify({ type: 'negative', message: 'Gagal membuka materi.' })
  }
}

const deleteTajwid = (section) => {
  $q.dialog({
    title: 'Konfirmasi',
    message: 'Apakah anda yakin akan menghapus Hukum Tajwid ini?',
    ok: { label: 'Ya', color: 'primary', flat: true },
    cancel: { label: 'Batal', color: 'negative', flat: true },
    persistent: true
  }).onOk(async () => {
    await axios.delete(`${api.API_BASE_URL}/sections/${section.id}`, { headers: authHeader() })
    $q.notify({ type: 'positive', message: 'Hukum Tajwid berhasil dihapus', position: 'top', timeout: 2000 })
    sections.value = []
    skipGurus.value = 0
    completedCount.value = 0
    await fetchSection()
  })
}
</script>

<style scoped>
.kurikulum-page { background: var(--serene-bg); min-height: 100vh; }
.kurikulum-container { max-width: 1280px; margin: 0 auto; padding: 24px 20px; }
.kurikulum-header { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
.kurikulum-title { font-size: 1.8rem; color: var(--serene-on-surface); }
.kurikulum-progress { border-radius: 16px; padding: 24px; }
.roadmap { position: relative; padding-left: 8px; }
.roadmap-node { position: relative; display: flex; align-items: flex-start; gap: 16px; padding-bottom: 20px; }
.roadmap-node::before {
  content: ''; position: absolute; left: 21px; top: 44px; bottom: -4px;
  width: 2px; background: var(--serene-surface); z-index: 0;
}
.roadmap-node:last-child::before { display: none; }
.roadmap-marker {
  position: relative; z-index: 1; flex: 0 0 auto;
  width: 44px; height: 44px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  background: var(--serene-surface); color: var(--serene-outline-variant);
}
.roadmap-node.is-done .roadmap-marker { background: var(--serene-secondary-container); color: var(--serene-secondary); }
.roadmap-node.is-active .roadmap-marker { background: var(--serene-primary-container); color: var(--serene-primary); box-shadow: 0 0 0 4px rgba(0,105,72,.15); }
.roadmap-card { flex: 1; border-radius: 16px; padding: 18px; }
.roadmap-avatar { font-weight: 700; }
.ellipsis { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.min-width-0 { min-width: 0; }
.serene-btn-ghost { color: var(--serene-primary); }
@media (max-width: 1023px) {
  .kurikulum-container { padding: 16px 14px; }
  .kurikulum-title { font-size: 1.4rem; }
  .roadmap-card { padding: 14px; }
}
</style>
