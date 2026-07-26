<template>
  <q-page padding>
    <!-- Form Profil -->
    <q-card class="my-card">
      <q-card-section>
        <div class="text-h6">Profil Saya</div>

        <q-form @submit.prevent="submitProfile" ref="formRef" class="q-gutter-md q-mt-md">
          <!-- Avatar Preview -->
          <div class="text-center">
            <q-avatar size="100px" rounded>
              <q-img :src="avatarPreview" />
            </q-avatar>
            <div class="q-mt-sm">
              <q-uploader
                flat
                bordered
                accept="image/*"
                label="Ubah Avatar"
                :auto-upload="false"
                @added="onAvatarChange"
                style="max-width: 300px; margin: auto"
              />
            </div>
          </div>

          <!-- Profile Fields -->
          <q-input v-model="form.display_name" label="Nama Lengkap" filled />
          <q-input v-model="form.jobtitle" label="Pekerjaan / Kegiatan" filled />
          <q-input v-model="form.tagline" label="Tagline (Opsional)" filled />
          <q-input v-model="form.about_me" label="Tentang Saya" filled type="textarea" rows="2" />
          <q-input v-model="form.skills" label="Keahlian (pisahkan dengan koma)" filled />

          <div class="row justify-end q-gutter-sm">
            <q-btn label="Simpan Perubahan" color="primary" :loading="loading" type="submit" />
          </div>
        </q-form>
      </q-card-section>
    </q-card>

    <!-- Riwayat Video -->
    <q-card class="my-card q-mt-lg">
      <q-card-section>
        <div class="text-h6 q-mb-md">Riwayat Video Pembelajaran</div>

        <q-list bordered separator>
          <q-item v-for="item in history" :key="item.id" class="q-mb-sm" clickable @click="openModule(item)">
            <q-item-section>
              <q-item-label class="text-bold">
                {{ item.module_detail?.title || 'Tanpa Judul' }}
              </q-item-label>
              <q-item-label caption class="text-grey-7">
                {{ item.module_detail?.module_detail?.title || 'Tanpa Modul' }}
              </q-item-label>
              <q-item-label caption>
                {{ item.is_complete ? '✅ Selesai' : '⏳ Belum Selesai' }}
              </q-item-label>

              <q-linear-progress
                :value="item.duration ? item.last_position / item.duration : 0"
                color="primary"
                rounded
                size="10px"
                class="q-mt-sm"
              />
            </q-item-section>
          </q-item>
        </q-list>

        <q-btn
          v-if="hasMoreHistory"
          class="full-width q-mt-md"
          label="Tampilkan lebih banyak"
          :loading="loadingHistory"
          :disable="loadingHistory"
          flat
          @click="loadVideoHistory"
        />
      </q-card-section>
    </q-card>

    <!-- Riwayat Quiz -->
    <q-card class="my-card q-mt-lg">
      <q-card-section>
        <div class="text-h6 q-mb-md">Riwayat Quiz</div>

        <q-list bordered separator>
          <q-item v-for="quiz in groupedQuizzes" :key="quiz.quiz_id" class="q-mb-sm" clickable @click="openAnswer(quiz)">
            <q-item-section>
              <q-item-label class="text-bold">{{ quiz.quiz_detail.question }}</q-item-label>
              <q-item-label caption class="text-grey-7">
                {{ quiz.quiz_detail?.module_detail?.title }}
              </q-item-label>
              <q-item-label caption>
                {{ quiz.is_passed ? '✅ Selesai' : '⏳ Belum Selesai' }}
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useQuasar } from 'quasar'
import api from 'src/config/api'
import { useRouter } from 'vue-router' 
const router = useRouter()

const $q = useQuasar()
const API_BASE_URL = api.API_BASE_URL
const API_UPLOADS_URL = api.API_UPLOADS_URL

const userId = localStorage.getItem('id')
const accessToken = localStorage.getItem('token')

const formRef = ref(null)
const loading = ref(false)

const form = ref({
  id: null,
  user_id: Number(userId),
  display_name: '',
  jobtitle: '',
  tagline: '',
  about_me: '',
  skills: '',
  avatar: '',
  avatarFile: null
})

const avatarPreview = ref('https://placehold.co/300x300')

const onAvatarChange = (files) => {
  form.value.avatarFile = files[0]
  avatarPreview.value = URL.createObjectURL(files[0])
}

const loadProfile = async () => {
  try {
    const res = await axios.get(`${API_BASE_URL}/profiles`, {
      headers: { Authorization: `${accessToken}` },
      params: { user_id: userId }
    })

    const profile = res.data.data?.[0] || res.data[0]
    if (profile) {
      form.value = {
        ...form.value,
        ...profile,
        avatarFile: null
      }

      avatarPreview.value = profile.avatar
        ? `${API_UPLOADS_URL}/${profile.avatar}`
        : 'https://placehold.co/300x300'
    }
  } catch (err) {
    console.error('Gagal memuat profil:', err)
    $q.notify({ type: 'negative', message: 'Gagal memuat profil' })
  }
}

const submitProfile = async () => {
  if (!formRef.value.validate()) return
  loading.value = true

  try {
    let avatarFilename = form.value.avatar

    if (form.value.avatarFile) {
      const formData = new FormData()
      formData.append('file', form.value.avatarFile)

      const uploadRes = await axios.post(`${API_BASE_URL}/uploads`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `${accessToken}`
        }
      })

      avatarFilename = uploadRes.data.filename
    }

    const payload = {
      display_name: form.value.display_name || '',
      jobtitle: form.value.jobtitle || '',
      tagline: form.value.tagline || '',
      about_me: form.value.about_me || '',
      skills: form.value.skills || '',
      avatar: avatarFilename
    }

    await axios.patch(`${API_BASE_URL}/profiles/${form.value.id}`, payload, {
      headers: { Authorization: `${accessToken}` }
    })

    // Update localStorage after successful PATCH
    const currentProfile = JSON.parse(localStorage.getItem('profile')) || {}

    const updatedProfile = {
      ...currentProfile,
      display_name: payload.display_name,
      jobtitle: payload.jobtitle,
      tagline: payload.tagline,
      about_me: payload.about_me,
      skills: payload.skills,
      avatar: avatarFilename,
      updated_date: new Date().toISOString()
    }

    localStorage.setItem('profile', JSON.stringify(updatedProfile))

    $q.dialog({
      title: 'Berhasil',
      message: 'Profil berhasil diperbarui.',
      ok: { label: 'OK', color: 'primary' }
    }).onOk(() => {
      location.reload()
    })
  } catch (err) {
    console.error(err)
    $q.notify({ type: 'negative', message: 'Gagal memperbarui profil' })
  } finally {
    loading.value = false
  }
}

// Video Log History
const history = ref([])
const skipHistory = ref(0)
const limitHistory = 5
const hasMoreHistory = ref(true)
const loadingHistory = ref(false)

const loadVideoHistory = async () => {
  if (loadingHistory.value || !hasMoreHistory.value) return
  loadingHistory.value = true
  try {
    const res = await axios.get(`${API_BASE_URL}/videologs`, {
      headers: { Authorization: `${accessToken}` },
      params: {
        user_id: userId,
        $skip: skipHistory.value,
        $limit: limitHistory
      }
    })

    const fetched = res.data.data || res.data
    if (fetched.length) {
      history.value.push(...fetched)
      skipHistory.value += fetched.length
    }
    hasMoreHistory.value = fetched.length === limitHistory
  } catch (err) {
    console.error('Gagal mengambil history video:', err)
    $q.notify({ type: 'negative', message: 'Gagal memuat riwayat video' })
  } finally {
    loadingHistory.value = false
  }
}

// Quiz Answer History
const groupedQuizzes = ref([])

const loadQuizHistory = async () => {
  try {
    const res = await axios.get(`${API_BASE_URL}/answers`, {
      headers: {
        Authorization: `${accessToken}`
      },
      params: {
        $or: [
          { user_id: userId },
          { reply_to: userId }
        ]
      }
    })

    const rawAnswers = res.data.data || res.data
    const quizMap = new Map()
    rawAnswers.forEach(answer => {
      const existing = quizMap.get(answer.quiz_id)

      // Jika belum ada, simpan answer pertama
      if (!existing) {
        quizMap.set(answer.quiz_id, answer)
      }
      // Jika sudah ada tapi yang baru ini is_passed === 1, timpa
      else if (answer.is_passed === 1) {
        quizMap.set(answer.quiz_id, answer)
      }
    })
    
    groupedQuizzes.value = Array.from(quizMap.values())
    
    console.log(groupedQuizzes);
  } catch (err) {
    console.error('Gagal memuat riwayat quiz:', err)
    $q.notify({ type: 'negative', message: 'Gagal memuat riwayat quiz' })
  }
}

const openModule = (item) => {
  // item.parent_id = module id (videologs.parent_id)
  router.push(`/module/${item.parent_id}`)
}

const openAnswer = (item) => {
    // Contoh: navigasi ke halaman detail jawaban atau pemutar voice note
    router.push(`/quiz-answer/${item.quiz_id}/${item.user_id}`) // atau sesuai route yang kamu punya
  }

onMounted(() => {
  loadProfile()
  loadVideoHistory()
  loadQuizHistory()
})
</script>

<style scoped>
.my-card {
  max-width: 600px;
  margin: auto;
}
.q-item-label {
  line-height: 1.2;
}
</style>
