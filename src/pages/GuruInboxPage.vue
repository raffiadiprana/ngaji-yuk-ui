<template>
    <q-page class="inbox-page">
      <div class="page-container">
        <div class="text-h6 text-center q-mb-md text-serene-on-surface" style="font-weight: 600;">
          Inbox
        </div>

        <q-input
          rounded
          outlined
          dense
          placeholder="Cari jawaban..."
          v-model="search"
          debounce="300"
          clearable
          prepend-inner-icon="search"
          class="serene-pill-input"
          style="max-width: 400px; margin: 0 auto 20px;"
        />

        <q-list bordered separator class="serene-card" style="max-width: 400px; margin: 0 auto;">
          <q-item v-if="loading" bordered>
            <q-item-section class="text-center">
              Memuat...
            </q-item-section>
          </q-item>

          <q-item
            v-else
            v-for="thread in filteredThreads"
            :key="thread.quiz_id"
            clickable
            @click="openAnswer(thread.lastAnswer)"
            class="interactive hover-lift"
          >
            <q-item-section avatar>
              <q-avatar size="36px" class="q-mr-sm">
                <img :src="thread.lastAnswer.user_detail?.avatar ? api.API_UPLOADS_URL + '/' + thread.lastAnswer.user_detail?.avatar : 'https://placehold.co/100?text=👤'" alt="Avatar" />
              </q-avatar>
            </q-item-section>

            <q-item-section>
              <q-item-label lines="1" class="text-weight-bold text-serene-on-surface" style="font-size: 16px;">
                {{ (thread.lastAnswer.user_detail?.display_name || thread.lastAnswer.user_detail?.email || ('User ' + (thread.lastAnswer.user_id || thread.quiz_id))) }} - {{ (thread.lastAnswer.quiz_detail?.module_detail?.title || ('Module #' + thread.quiz_id)) }}
              </q-item-label>
              <q-item-label caption lines="1" class="text-serene-variant" style="font-size: 13px;">
                {{ thread.lastAnswer.answer_type === 'file' ? 'Voice Note' : thread.lastAnswer.answer_value }}
              </q-item-label>
            </q-item-section>

            <q-item-section side class="text-right" style="min-width: 70px;">
              <div style="font-size: 12px; color: var(--serene-variant);">
                {{ formatTime(thread.lastAnswer.created_date) }}
              </div>
              <q-badge v-if="thread.count > 1" color="serene-primary" class="q-mt-xs" style="border-radius: 9999px;">
                +{{ thread.count - 1 }}
              </q-badge>
            </q-item-section>
          </q-item>

          <q-item v-if="!loading && filteredThreads.length === 0" bordered>
            <q-item-section class="text-center text-serene-variant q-py-md">
              <q-icon name="chat" size="40px" color="serene-variant" class="q-mb-sm" />
              <div class="text-weight-medium text-serene-on-surface">Belum ada percakapan masuk</div>
              <div class="q-mt-xs">Santri akan memulai chat dari modul tajwid untuk bertanya. Pantau halaman ini untuk menjawabnya.</div>
            </q-item-section>
          </q-item>
        </q-list>
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
  
  const instructorId = localStorage.getItem('id')
  
  const fetchAnswers = async () => {
    try {
      const instructorId = Number(localStorage.getItem('id'))
      const res = await axios.post(`${api.API_BASE_URL}/answers/inbox`, {
        instructor_id: Number.isFinite(instructorId) ? instructorId : null
      }, {
        headers: authHeader(),
        params: { $limit: 200 }
      })
      const answers = Array.isArray(res.data) ? res.data : (res.data.data || [])
      const map = {}
      for (const a of answers) {
        const key = a.quiz_id
        if (!map[key]) map[key] = { quiz_id: key, count: a.count || 0, lastAnswer: a }
        else {
          map[key].count = a.count || map[key].count
          if (a.lastAnswer && (!map[key].lastAnswer || new Date(a.lastAnswer.created_date) > new Date(map[key].lastAnswer.created_date))) {
            map[key].lastAnswer = a.lastAnswer
          }
        }
      }
      threads.value = Object.values(map).sort((a, b) => new Date(b.lastAnswer?.created_date || 0) - new Date(a.lastAnswer?.created_date || 0))
    } catch (error) {
      console.error('Failed to fetch answers:', error)
      threads.value = []
    } finally {
      loading.value = false
    }
  }
  
  const threads = ref([])
  
  onMounted(() => {
    fetchAnswers()
  })
  onUnmounted(() => {
    if (window._guruInboxTimer) clearInterval(window._guruInboxTimer)
  })
  
  const filteredThreads = computed(() => {
    if (!search.value) return threads.value
    const lower = search.value.toLowerCase()
    return threads.value.filter(t =>
      (t.lastAnswer.user_detail?.display_name || ('User ' + t.lastAnswer.user_id)).toLowerCase().includes(lower) ||
      (t.lastAnswer.answer_value || '').toLowerCase().includes(lower)
    )
  })

  const getInitials = (name) => {
    if (!name) return ''
    const parts = name.split(' ')
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
    return parts[0].charAt(0).toUpperCase() + parts[1].charAt(0).toUpperCase()
  }
  
  const formatTime = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  
  const openAnswer = (answer) => {
    router.push(`/guru-quiz-answer/${answer.quiz_id}/${answer.user_id}`)
  }
  </script>
  
  <style scoped>
  .q-list {
    padding-top: 0;
    padding-bottom: 0;
  }
  
  .q-avatar {
    width: 40px;
    height: 40px;
    font-weight: 600;
    font-size: 16px;
  }
  
  .q-item {
    padding-top: 8px;
    padding-bottom: 8px;
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
  