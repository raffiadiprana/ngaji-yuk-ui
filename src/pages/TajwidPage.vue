<template>
  <div class="kurikulum-page q-pa-md">
    <div class="kurikulum-container">
      <!-- Header -->
      <header class="kurikulum-header q-mb-lg">
        <div>
          <h1 class="headline-font kurikulum-title">Kurikulum Tajwid</h1>
          <p class="text-serene-variant">Kelola materi pembelajaran untuk murid-murid Anda.</p>
        </div>
        <div class="row q-gutter-sm">
          <q-btn v-if="isAdmin" class="serene-btn-primary" label="Tambah Hukum Tajwid" icon="add" rounded @click="onAddTajwid" />
        </div>
      </header>

      <!-- Timeline / Section Cards -->
      <section class="timeline">
        <div v-if="!sections.length" class="text-center text-serene-variant q-py-lg">Belum ada hukum tajwid.</div>
        <div
          v-for="sec in sections"
          :key="sec.id"
          class="timeline-node"
          :class="sectionStatus(sec).cls"
        >
          <div class="timeline-marker">
            <q-icon :name="sectionStatus(sec).icon" size="22px" />
          </div>
          <q-card class="serene-card timeline-card">
            <div class="row items-start no-wrap">
              <div class="col min-width-0">
                <div class="text-weight-bold text-serene-on-surface text-subtitle1 ellipsis">{{ sec.section_name }}</div>
                <div class="text-caption text-serene-variant q-mt-xs">
                  {{ sec._done }}/{{ sec._total }} modul · {{ sec._percent }}%
                </div>
                <q-linear-progress :value="sec._percent / 100" color="serene-primary" class="q-mt-xs rounded-borders" style="height:6px;" />
              </div>
              <q-chip :color="sectionStatus(sec).chipColor" text-color="white" size="sm" class="q-ml-sm">{{ sectionStatus(sec).label }}</q-chip>
            </div>

            <!-- Module Grid -->
            <div v-if="(sec._modules || []).length" class="row q-col-gutter-md q-mt-md">
              <div
                v-for="(m, i) in sec._modules"
                :key="m.id"
                class="col-12 col-sm-6 col-md-4"
              >
                <q-card class="module-card serene-card" :class="{ 'sub-locked': m.is_locked }">
                  <q-card-section>
                    <div class="row items-center no-wrap">
                      <div class="sub-icon flex flex-center q-mr-sm">
                        <q-icon :name="m.is_completed ? 'check_circle' : (m.is_locked ? 'lock' : 'play_circle')" :color="m.is_completed ? 'serene-secondary' : (m.is_locked ? 'grey' : 'serene-primary')" size="20px" />
                      </div>
                      <div class="col min-width-0">
                        <div class="text-weight-medium text-serene-on-surface ellipsis">{{ i + 1 }}. {{ m.title }}</div>
                        <div class="text-caption text-serene-variant">{{ m.is_completed ? 'Selesai' : (m.is_locked ? 'Terkunci' : 'Siap dipelajari') }}</div>
                      </div>
                    </div>
                  </q-card-section>
                  <q-card-actions align="right">
                    <q-btn
                      unelevated
                      dense
                      rounded
                      :color="m.is_completed ? 'serene-secondary-container' : 'serene-primary'"
                      :text-color="m.is_completed ? 'serene-on-secondary-container' : 'white'"
                      :label="m.is_completed ? 'Review' : 'Mulai'"
                      @click="goModule(m.id)"
                    />
                  </q-card-actions>
                </q-card>
              </div>
            </div>
          </q-card>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { useQuasar } from 'quasar'
const $q = useQuasar()
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import api from 'src/config/api'
import { authHeader } from 'src/config/auth'

const router = useRouter()

const sections = ref([])
const allModules = ref([])

const role = ref(localStorage.getItem('role') || '')
const isGuru = computed(() => role.value === 'guru')
const isAdmin = computed(() => role.value === 'admin')

const totalModules = computed(() => allModules.value.length)
const doneModules = computed(() => allModules.value.filter(m => m.is_completed).length)
const overallProgress = computed(() => totalModules.value ? Math.round((doneModules.value / totalModules.value) * 100) : 0)

// Hitung status tiap section dari modulnya
const enrichSections = () => {
  sections.value.forEach(sec => {
    const mods = allModules.value.filter(m => m.section_id === sec.id)
    sec._modules = mods
    sec._total = mods.length
    sec._done = mods.filter(m => m.is_completed).length
    sec._percent = sec._total ? Math.round((sec._done / sec._total) * 100) : 0
  })
}

const sectionStatus = (sec) => {
  const mods = sec._modules || []
  if (!mods.length) return { cls: 'is-todo', icon: 'radio_button_unchecked', label: 'Segera', chipColor: 'grey' }
  const allDone = mods.every(m => m.is_completed)
  if (allDone) return { cls: 'is-done', icon: 'check_circle', label: 'Selesai', chipColor: 'serene-secondary' }
  const hasUnlocked = mods.some(m => !m.is_locked)
  if (hasUnlocked) return { cls: 'is-active', icon: 'play_circle', label: 'Berlangsung', chipColor: 'serene-primary' }
  return { cls: 'is-locked', icon: 'lock', label: 'Terkunci', chipColor: 'grey' }
}

onMounted(async () => {
  await Promise.all([fetchSection(), fetchAllModules()])
  enrichSections()
})

const fetchAllModules = async () => {
  try {
    const res = await axios.get(`${api.API_BASE_URL}/modules`, { headers: authHeader(), params: { is_deleted: 0, '$limit': 100 } })
    allModules.value = res.data?.data ?? []
  } catch (e) { console.error('[TajwidPage] gagal ambil modules:', e) }
}

const fetchSection = async () => {
  try {
    const res = await axios.get(`${api.API_BASE_URL}/sections`, { headers: authHeader() })
    const fetched = res.data.data || []
    fetched.sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
    sections.value = fetched
  } catch (err) { console.error('Failed to fetch sections:', err) }
}

const onAddTajwid = () => router.push('/tajwid-form')
const editTajwid = (tajwid) => router.push(`/tajwid-form/${tajwid.id}`)
const addMaterial = (tajwid) => router.push(`/module-form?section_id=${tajwid.id}`)

const goModule = (id) => {
  location.hash = `/module/${id}`
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
    await fetchSection()
    enrichSections()
  })
}
</script>

<style scoped>
.kurikulum-page { background: var(--serene-bg); min-height: 100vh; }
.kurikulum-container { max-width: 1280px; margin: 0 auto; padding: 24px 20px; }
.kurikulum-header { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
.kurikulum-title { font-size: 1.8rem; color: var(--serene-on-surface); }
.kurikulum-progress { border-radius: 16px; padding: 24px; }
.timeline { position: relative; padding-left: 8px; }
.timeline-node { position: relative; display: flex; align-items: flex-start; gap: 16px; padding-bottom: 22px; }
.timeline-node::before {
  content: ''; position: absolute; left: 21px; top: 44px; bottom: -4px;
  width: 2px; background: var(--serene-surface); z-index: 0;
}
.timeline-node:last-child::before { display: none; }
.timeline-marker {
  position: relative; z-index: 1; flex: 0 0 auto;
  width: 44px; height: 44px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  background: var(--serene-surface); color: var(--serene-outline-variant);
}
.timeline-node.is-done .timeline-marker { background: var(--serene-secondary-container); color: var(--serene-secondary); }
.timeline-node.is-active .timeline-marker { background: var(--serene-primary-container); color: var(--serene-primary); box-shadow: 0 0 0 4px rgba(0,105,72,.15); }
.timeline-node.is-locked .timeline-marker { background: var(--serene-surface-variant); color: var(--serene-outline-variant); }
.timeline-card { flex: 1; border-radius: 16px; padding: 18px; }
.timeline-node.is-locked .timeline-card { opacity: .72; }
.ellipsis { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.min-width-0 { min-width: 0; }
.sub-lessons { border-top: 1px solid var(--serene-border); }
.sub-lesson { cursor: pointer; transition: background .15s ease; }
.sub-lesson:hover { background: var(--serene-surface); }
.sub-lesson.sub-locked { cursor: not-allowed; }
.sub-icon { width: 32px; height: 32px; border-radius: 50%; background: var(--serene-surface); }
.serene-btn-ghost { color: var(--serene-primary); }
.module-card { border-radius: 16px; padding: 16px; transition: transform .15s ease, box-shadow .15s ease; }
.module-card:hover { transform: translateY(-2px); }
.module-card.sub-locked { opacity: .72; }
@media (max-width: 1023px) {
  .kurikulum-container { padding: 16px 14px; }
  .kurikulum-title { font-size: 1.4rem; }
  .timeline-card { padding: 14px; }
}
</style>
