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
            v-for="item in filteredItems"
            :key="item.id"
            clickable
            @click="openAnswer(item)"
            class="interactive hover-lift"
          >
            <q-item-section avatar>
              <q-avatar size="36px" class="q-mr-sm">
                <img :src="item.user_detail?.avatar ? api.API_UPLOADS_URL + '/' + item.user_detail?.avatar : 'https://placehold.co/100?text=👤'" alt="Avatar" />
              </q-avatar>
            </q-item-section>

            <q-item-section>
              <q-item-label lines="1" class="text-weight-bold text-serene-on-surface" style="font-size: 16px;">
                {{ item.user_detail?.display_name || ('User ' + item.user_id) }} - {{ item.quiz_detail?.module_detail?.title }}
              </q-item-label>
              <q-item-label caption lines="1" class="text-serene-variant" style="font-size: 13px;">
                {{ item.answer_type === 'file' ? 'Voice Note' : item.answer_value }}
              </q-item-label>
            </q-item-section>

            <q-item-section side class="text-right" style="min-width: 70px;">
              <div style="font-size: 12px; color: var(--serene-variant);">
                {{ formatTime(item.created_date) }}
              </div>
            </q-item-section>
          </q-item>

          <q-item v-if="!loading && filteredItems.length === 0" bordered>
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
  import { ref, computed, onMounted } from 'vue'
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
    loading.value = true
    try {
      const res = await axios.get(`${api.API_BASE_URL}/answers`, {
        headers: authHeader(),
        params: { 
            instructor_id: instructorId,
            'user_id[$ne]': instructorId
        }
      })
      items.value = res.data.data.filter(answer => 
        (!answer.checked_by || answer.checked_by === null)
      ) || [];
    } catch (error) {
      console.error('Failed to fetch answers:', error)
      items.value = []
    } finally {
      loading.value = false
    }
  }
  
  onMounted(() => {
    fetchAnswers()
  })
  
  const filteredItems = computed(() => {
    if (!search.value) return items.value
    const lower = search.value.toLowerCase()
    return items.value.filter(item =>
      (item.user_detail?.display_name || ('User ' + item.user_id)).toLowerCase().includes(lower) ||
      (item.answer_value || '').toLowerCase().includes(lower)
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
  
  const openAnswer = (item) => {
    // Contoh: navigasi ke halaman detail jawaban atau pemutar voice note
    router.push(`/guru-quiz-answer/${item.quiz_id}/${item.user_id}`) // atau sesuai route yang kamu punya
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
  