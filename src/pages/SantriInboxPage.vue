<template>
  <q-page class="inbox-page">
    <div class="page-container">
      <div class="page-title q-mb-md">Chat</div>

      <q-input
        rounded
        outlined
        dense
        placeholder="Cari percakapan..."
        v-model="search"
        debounce="300"
        clearable
        prepend-inner-icon="search"
        class="serene-pill-input"
        style="max-width: 400px; margin: 0 auto 20px;"
      />

      <q-list bordered separator class="serene-card" style="max-width: 600px; margin: 0 auto;" v-if="!loading && filteredItems.length">
        <q-item
          v-for="item in filteredItems"
          :key="item.id"
          clickable
          @click="openAnswer(item)"
          class="interactive hover-lift"
        >
          <q-item-section avatar>
            <q-avatar size="44px" class="q-mr-sm">
              <img :src="(item.user_detail?.avatar || item.instructor_detail?.avatar) ? api.API_UPLOADS_URL + '/' + (item.user_detail?.avatar || item.instructor_detail?.avatar) : 'https://placehold.co/100?text=👤'" alt="Avatar" />
            </q-avatar>
          </q-item-section>

          <q-item-section>
            <q-item-label lines="1" class="text-weight-bold text-serene-on-surface" style="font-size: 16px;">
              {{ item.user_detail?.username || item.user_detail?.email || item.instructor_detail?.username || item.instructor_detail?.email || ('User ' + (item.user_id || item.reply_to)) }} — {{ item.quiz_detail?.module_detail?.title || 'Chat' }}
            </q-item-label>
            <q-item-label caption lines="1" class="text-serene-variant" style="font-size: 13px;">
              {{ item.answer_type === 'file' ? 'Voice Note' : (item.answer_value || 'Percakapan baru') }}
            </q-item-label>
          </q-item-section>

          <q-item-section side class="text-right" style="min-width: 70px;">
            <div style="font-size: 12px; color: var(--serene-variant);">
              {{ formatTime(item.updated_date || item.created_date) }}
            </div>
          </q-item-section>
        </q-item>
      </q-list>

      <div class="serene-card text-center q-py-lg text-serene-variant q-mt-md" style="max-width: 600px; margin: 0 auto;" v-if="!loading && !filteredItems.length">
        <q-icon name="chat" size="40px" color="serene-variant" class="q-mb-sm" />
        <div class="text-weight-medium text-serene-on-surface">Belum ada percakapan</div>
        <div class="q-mt-xs">Pelajari materi tajwid, lalu mulai chat dengan guru untuk bertanya hal yang belum dipahami.</div>
      </div>

      <div class="text-center q-py-md text-serene-variant" v-if="loading">
        Memuat...
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import axios from 'axios'
import api from 'src/config/api'
import { authHeader } from 'src/config/auth'
import { useRouter } from 'vue-router'

const router = useRouter()
const search = ref('')
const items = ref([])
const loading = ref(false)
const userId = Number(localStorage.getItem('id'))

const fetchAnswers = async () => {
  loading.value = true
  try {
    const res = await axios.get(`${api.API_BASE_URL}/answers`, {
      headers: authHeader(),
      params: {
        '$or': [
          { user_id: userId },
          { reply_to: userId }
        ],
        '$limit': 200
      }
    })
    const data = res.data.data || []
    const seen = new Set()
    const merged = []
    data.forEach(answer => {
      const key = `${answer.quiz_id}|${answer.user_id}|${answer.reply_to || 'null'}`
      if (!seen.has(key)) {
        seen.add(key)
        merged.push(answer)
      }
    })
    items.value = merged
  } catch (error) {
    console.error('Failed to fetch answers:', error)
    items.value = []
  } finally {
    loading.value = false
  }
}

const filteredItems = computed(() => {
  if (!search.value) return items.value
  const lower = search.value.toLowerCase()
  return items.value.filter(item =>
    (item.user_detail?.username || item.user_detail?.email || item.instructor_detail?.username || item.instructor_detail?.email || '').toLowerCase().includes(lower) ||
    (item.answer_value || '').toLowerCase().includes(lower) ||
    (item.quiz_detail?.module_detail?.title || '').toLowerCase().includes(lower)
  )
})

const formatTime = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const openAnswer = (item) => {
  const peerId = item.user_id === userId ? (item.reply_to || item.instructor_id || userId) : item.user_id
  if (!peerId) return
  router.push(`/quiz-answer/${item.quiz_id}/${peerId}`)
}

onMounted(() => {
  fetchAnswers()
})
onUnmounted(() => {
  if (window._santriInboxTimer) clearInterval(window._santriInboxTimer)
})
</script>

<style scoped>
.page-title {
  font-size: 1.35rem;
  font-weight: 600;
  color: var(--serene-on-surface);
  text-align: center;
}

.q-list {
  padding-top: 0;
  padding-bottom: 0;
}

.q-avatar {
  width: 44px;
  height: 44px;
  font-weight: 600;
  font-size: 16px;
}

.q-item {
  padding-top: 10px;
  padding-bottom: 10px;
}

.inbox-page {
  min-height: 100vh;
  background: var(--serene-bg);
  position: relative;
}

.page-container {
  position: relative;
  z-index: 1;
  padding: 24px 16px;
}
</style>
