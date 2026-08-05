<template>
  <div class="guru-page">
    <div class="page-container q-pa-md">
      <!-- Welcome Section -->
      <div class="welcome-section serene-card">
        <div class="welcome-content">
          <h4 class="welcome-title">
            Assalamu'alaikum, {{ profile.display_name || 'Ustadz' }}
          </h4>
          <p class="welcome-subtitle">Kelola modul, pantau progres santri, dan jawab chat pembelajaran tajwid.</p>
        </div>
        <q-avatar size="48px" class="profile-avatar" @click="$router.push('/profile')">
          <img :src="profile.avatar ? api.API_UPLOADS_URL + '/' + profile.avatar : 'https://placehold.co/100?text=👤'" alt="Avatar" />
        </q-avatar>
      </div>

      <!-- Metrics -->
      <div class="metrics-grid q-mt-lg">
        <div class="metric-card serene-card">
          <div class="metric-icon"><q-icon name="group" color="serene-primary" /></div>
          <div class="metric-body">
            <div class="metric-value">{{ metrics.totalStudents }}</div>
            <div class="metric-label">Total Santri</div>
          </div>
        </div>
        <div class="metric-card serene-card">
          <div class="metric-icon"><q-icon name="collections_bookmark" color="serene-primary" /></div>
          <div class="metric-body">
            <div class="metric-value">{{ metrics.activeModules }}</div>
            <div class="metric-label">Modul Aktif</div>
          </div>
        </div>
        <div class="metric-card serene-card">
          <div class="metric-icon"><q-icon name="insights" color="serene-primary" /></div>
          <div class="metric-body">
            <div class="metric-value">{{ metrics.avgCompletion }}%</div>
            <div class="metric-label">Progress Rata-rata</div>
          </div>
        </div>
        <div class="metric-card serene-card">
          <div class="metric-icon"><q-icon name="chat" color="serene-primary" /></div>
          <div class="metric-body">
            <div class="metric-value">{{ metrics.unreadMessages }}</div>
            <div class="metric-label">Chat Masuk</div>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="section-card serene-card q-mt-lg">
        <div class="section-header">
          <h5 class="section-title">
            <q-icon name="history" color="serene-primary" class="q-mr-sm" />
            Aktivitas Terbaru
          </h5>
        </div>

        <div v-if="loadingActivity" class="text-center q-py-md text-serene-variant">
          Memuat...
        </div>

        <q-list v-else separator class="activity-list">
          <q-item v-for="item in recentActivity" :key="item.id" class="interactive">
            <q-item-section avatar>
              <q-avatar size="36px" color="primary-container" text-color="primary">
                <q-icon name="play_circle" />
              </q-avatar>
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-bold text-serene-on-surface">{{ item.user_detail?.username || item.user_detail?.email || ('User ' + item.user_id) }}</q-item-label>
              <q-item-label caption class="text-serene-variant ellipsis-text">
                Menonton modul: {{ item.module_title || 'Modul' }}
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <div class="text-caption text-serene-variant">{{ formatDate(item.created_date) }}</div>
            </q-item-section>
          </q-item>
        </q-list>

        <div v-if="!loadingActivity && recentActivity.length === 0" class="empty-state text-serene-variant q-py-lg text-center">
          Belum ada aktivitas santri.
        </div>
      </div>

      <!-- Chat Section -->
      <div class="section-card serene-card q-mt-lg">
        <div class="section-header">
          <h5 class="section-title">
            <q-icon name="chat" color="serene-primary" class="q-mr-sm" />
            Chat Masuk
          </h5>
          <q-btn label="Lihat Semua" flat dense class="text-serene-primary" @click="router.push('/guru-inbox')" />
        </div>

        <div v-if="loadingChats" class="text-center q-py-md text-serene-variant">
          Memuat...
        </div>

        <q-list v-else separator class="chat-list">
          <q-item v-for="item in incomingChats" :key="item.id" clickable @click="openChat(item)" class="interactive hover-lift">
            <q-item-section avatar>
              <q-avatar size="40px">
                <img :src="item.user_detail?.avatar ? api.API_UPLOADS_URL + '/' + item.user_detail?.avatar : 'https://placehold.co/100?text=👤'" />
              </q-avatar>
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-bold text-serene-on-surface">{{ item.user_detail?.username || item.user_detail?.email || ('User ' + item.user_id) }}</q-item-label>
              <q-item-label caption class="text-serene-variant ellipsis-text">{{ item.answer_type === 'file' ? 'Voice Note' : (item.answer_value || 'Chat baru') }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-btn flat round icon="chevron_right" @click.stop="openChat(item)" />
            </q-item-section>
          </q-item>
        </q-list>

        <div v-if="!loadingChats && incomingChats.length === 0" class="empty-state text-serene-variant q-py-lg text-center">
          Belum ada chat masuk dari santri.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { useQuasar } from 'quasar'
  const $q = useQuasar()
  import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
  import { useRouter } from 'vue-router'
  import axios from 'axios'
  import api from 'src/config/api'
  import { authHeader } from 'src/config/auth'

  const router = useRouter()

  const profile = ref({})
  const incomingChats = ref([])
  const recentActivity = ref([])
  const instructorId = localStorage.getItem('id')

  const metrics = reactive({
    totalStudents: 0,
    activeModules: 0,
    avgCompletion: 0,
    unreadMessages: 0
  })

  const loadingMetrics = ref(false)
  const loadingActivity = ref(false)
  const loadingChats = ref(false)
  const errorMetrics = ref(false)
  const errorActivity = ref(false)
  const errorChats = ref(false)

  let abortController = null

  const cancelPending = () => {
    if (abortController) {
      try { abortController.abort() } catch {}
      abortController = null
    }
  }

  const formatDate = (value) => {
    if (!value) return '-'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return String(value)
    return date.toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  const computeAvgCompletion = async () => {
    try {
      const [modulesRes, usersRes] = await Promise.allSettled([
        axios.get(`${api.API_BASE_URL}/modules`, {
          headers: authHeader(),
          params: { '$limit': 100 }
        }),
        axios.get(`${api.API_BASE_URL}/users`, {
          headers: authHeader(),
          params: { role: 'santri', '$limit': 100 }
        })
      ])

      const modules = (modulesRes.status === 'fulfilled' ? modulesRes.value.data.data : []) || []
      const users = (usersRes.status === 'fulfilled' ? usersRes.value.data.data : []) || []
      const nonRefModules = modules.filter((m) => m.category !== 'reference')

      metrics.activeModules = nonRefModules.length
      metrics.totalStudents = users.length

      if (users.length === 0 || nonRefModules.length === 0) {
        metrics.avgCompletion = 0
        return
      }

      const perStudent = await Promise.allSettled(
        users.map(async (u) => {
          const logsRes = await axios.get(`${api.API_BASE_URL}/videologs`, {
            headers: authHeader(),
            params: { user_id: u.id, '$limit': 500 }
          })
          const logs = (logsRes.status === 'fulfilled' ? logsRes.value.data.data : []) || []
          const uniqueModuleIds = new Set(logs.map((l) => l.module_id).filter(Boolean))
          return Math.round((uniqueModuleIds.size / nonRefModules.length) * 100)
        })
      )

      const completedPercents = perStudent
        .filter((p) => p.status === 'fulfilled')
        .map((p) => p.value)
      if (completedPercents.length === 0) {
        metrics.avgCompletion = 0
        return
      }
      metrics.avgCompletion = Math.round(
        completedPercents.reduce((a, b) => a + b, 0) / completedPercents.length
      )
    } catch (e) {
      metrics.avgCompletion = 0
    } finally {
      loadingMetrics.value = false
    }
  }

  const loadDashboard = async () => {
    cancelPending()
    abortController = new AbortController()
    loadingMetrics.value = true
    loadingActivity.value = true
    loadingChats.value = true
    errorMetrics.value = false
    errorActivity.value = false
    errorChats.value = false

    try {
      const [metricsPromise, activityPromise, chatPromise] = await Promise.allSettled([
        (async () => {
          await computeAvgCompletion()
        })(),
        (async () => {
          const res = await axios.get(`${api.API_BASE_URL}/videologs`, {
            headers: authHeader(),
            params: { instructor_id: instructorId, '$limit': 20 },
            signal: abortController.signal
          })
          recentActivity.value = (res.data.data || []).slice(0, 8)
        })(),
        (async () => {
          const res = await axios.get(`${api.API_BASE_URL}/answers/inbox`, {
            headers: authHeader(),
            params: { instructor_id: instructorId, $limit: 200 },
            signal: abortController.signal
          })
          const data = Array.isArray(res.data) ? res.data : (res.data.data || [])
          incomingChats.value = data.filter((answer) => !answer.checked_by)
          metrics.unreadMessages = incomingChats.value.length
        })()
      ])

      if (metricsPromise.status === 'rejected') errorMetrics.value = true
      if (activityPromise.status === 'rejected') errorActivity.value = true
      if (chatPromise.status === 'rejected') errorChats.value = true
    } catch (e) {
      if (axios.isCancel(e)) return
      errorMetrics.value = true
      errorActivity.value = true
      errorChats.value = true
    } finally {
      loadingMetrics.value = false
      loadingActivity.value = false
      loadingChats.value = false
    }
  }

  const openChat = (item) => {
    router.push(`/guru-quiz-answer/${item.quiz_id}/${item.user_id}`)
  }

  onMounted(async () => {
    const profileData = localStorage.getItem('profile')
    if (profileData) {
      try {
        profile.value = JSON.parse(profileData)
      } catch (e) {
        console.error('Error parsing profile from localStorage', e)
      }
    }
    await loadDashboard()
  })

  onBeforeUnmount(() => {
    cancelPending()
  })
</script>

<style scoped>
  .guru-page {
  min-height: 100vh;
  background: var(--serene-bg);
}

  .page-container {
    position: relative;
    z-index: 1;
    max-width: 1200px;
    margin: 0 auto;
  }

  .welcome-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px;
    margin-bottom: 24px;
  }

  .welcome-content {
    flex: 1;
  }

  .welcome-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--serene-on-surface);
    margin-bottom: 4px;
  }

  .welcome-subtitle {
    font-size: 1rem;
    color: var(--serene-variant);
  }

  .profile-avatar {
    cursor: pointer;
    border: 2px solid var(--serene-border);
    transition: transform 0.2s;
  }

  .profile-avatar:hover {
    transform: scale(1.05);
  }

  .section-card {
    background: white;
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 2px 15px rgba(0, 0, 0, 0.05);
  }

  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 18px;
  }

  .metric-card {
    display: flex;
    align-items: center;
    gap: 18px;
    border-radius: 16px;
    border: 1px solid var(--serene-border, #d3daea);
    background: #ffffff;
    box-shadow: 0 2px 15px rgba(0, 0, 0, 0.05);
    transition: transform .2s ease, box-shadow .2s ease;
  }

  .metric-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 25px rgba(0, 0, 0, 0.08);
  }

  .metric-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 46px;
    height: 46px;
    border-radius: 14px;
    background: rgba(0, 105, 72, 0.08);
    color: var(--serene-primary, #006948);
  }

  .metric-body {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .metric-value {
    font-size: 1.5rem;
    font-weight: 800;
    color: var(--serene-on-surface, #151c27);
    line-height: 1.1;
  }

  .metric-label {
    font-size: 0.78rem;
    color: var(--serene-variant, #546b5c);
    letter-spacing: 0.2px;
    text-transform: uppercase;
  }

  .activity-list .q-item {
    border-radius: 12px;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .section-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--serene-on-surface);
    display: flex;
    align-items: center;
    gap: 10px;
  }

  @media (max-width: 1024px) {
    .metrics-grid { grid-template-columns: repeat(2, 1fr); }
  }

  @media (max-width: 600px) {
    .metrics-grid { grid-template-columns: 1fr; }
    .card-grid { grid-template-columns: 1fr; }
    .section-header { flex-direction: column; align-items: flex-start; gap: 12px; }
    .welcome-section { flex-direction: column; align-items: flex-start; gap: 12px; }
  }
</style>
