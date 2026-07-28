<template>
  <q-page padding class="profile-page bg-serene">
    <div class="profile-container">
      <!-- Header Profil -->
      <section class="serene-card profile-header q-mb-lg">
        <div class="profile-header-inner">
          <div class="profile-avatar-wrap">
            <q-avatar size="120px" class="profile-avatar shadow-3">
              <q-img :src="avatarPreview" />
            </q-avatar>
            <q-btn
              round
              dense
              unelevated
              color="serene-primary"
              icon="edit"
              class="profile-edit-btn"
              size="sm"
            />
          </div>
          <div class="profile-id">
            <h1 class="headline-font profile-name">{{ form.display_name || 'Santri' }}</h1>
            <p class="text-serene-variant profile-role">{{ form.jobtitle || 'Pelajar Tajwid' }}</p>
            <div class="row q-gutter-sm q-mt-sm">
              <q-btn class="serene-btn-primary" label="Edit Profil" @click="scrollToForm" />
              <q-btn outline color="serene-primary" label="Pengaturan Akun" @click="$router.push('/settings')" />
            </div>
          </div>
        </div>
      </section>

      <!-- Stats Bento -->
      <section class="santri-grid-3 profile-stats q-mb-lg">
        <div class="col-12 col-md-4">
          <div class="serene-card-soft stat-card">
            <div class="row items-center justify-between q-mb-xs">
              <span class="text-serene-variant text-caption">Total Latihan Tajwid</span>
              <q-icon name="schedule" color="serene-primary" />
            </div>
            <div class="headline-font text-h5 text-serene-on-surface">128</div>
            <div class="text-caption text-serene-variant q-mt-xs">Jam belajar</div>
          </div>
        </div>
        <div class="col-12 col-md-4">
          <div class="serene-card-soft stat-card">
            <div class="row items-center justify-between q-mb-xs">
              <span class="text-serene-variant text-caption">Hukum Dikuasai</span>
              <q-icon name="auto_stories" color="serene-secondary" />
            </div>
            <div class="headline-font text-h5 text-serene-on-surface">42</div>
            <div class="text-caption text-serene-variant q-mt-xs">Aturan tajwid</div>
          </div>
        </div>
        <div class="col-12 col-md-4">
          <div class="serene-card-soft stat-card serene-tertiary-card">
            <div class="row items-center justify-between q-mb-xs">
              <span class="text-caption opacity-90">Lencana Keahlian</span>
              <q-icon name="workspace_premium" color="serene-secondary" />
            </div>
            <div class="headline-font text-h5 text-serene-on-surface">15</div>
            <div class="text-caption text-serene-variant q-mt-xs">Lencana diraih</div>
          </div>
        </div>
      </section>

      <!-- Form Profil -->
      <q-card class="serene-card q-mb-lg" id="profile-form">
        <q-card-section>
          <h2 class="headline-font section-h2 q-mb-md">Profil Saya</h2>
          <q-form @submit.prevent="submitProfile" ref="formRef" class="form-grid">
            <div class="col-span-2 text-center">
              <q-avatar size="96px" rounded class="profile-avatar-sm shadow-2">
                <q-img :src="avatarPreview" />
              </q-avatar>
              <div class="q-mt-sm">
                <q-uploader
                  flat bordered accept="image/*" label="Ubah Avatar"
                  :auto-upload="false" @added="onAvatarChange"
                  style="max-width: 300px; margin: auto"
                />
              </div>
            </div>

            <q-input v-model="form.display_name" label="Nama Lengkap" filled class="serene-input" color="serene-primary" />
            <q-input v-model="form.jobtitle" label="Pekerjaan / Kegiatan" filled class="serene-input" color="serene-primary" />
            <q-input v-model="form.tagline" label="Tagline (Opsional)" filled class="serene-input col-span-2" color="serene-primary" />
            <q-input v-model="form.about_me" label="Tentang Saya" filled type="textarea" rows="3" class="serene-input col-span-2" color="serene-primary" />
            <q-input v-model="form.skills" label="Keahlian (pisahkan dengan koma)" filled class="serene-input col-span-2" color="serene-primary" />

            <div class="col-span-2 row justify-end q-gutter-sm q-mt-sm">
              <q-btn label="Simpan Perubahan" class="serene-btn-primary" :loading="loading" type="submit" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>

      <!-- Keamanan Akun -->
      <q-card class="serene-card q-mb-lg">
        <q-card-section>
          <h2 class="headline-font section-h2 q-mb-md">Keamanan Akun</h2>
          <q-form @submit.prevent="changePassword" class="form-grid">
            <q-input
              v-model="pwd.current" label="Password Saat Ini"
              :type="showPwd ? 'text' : 'password'" filled class="serene-input col-span-2"
              color="serene-primary"
            >
              <template #append>
                <q-icon :name="showPwd ? 'visibility' : 'visibility_off'" class="cursor-pointer" @click="showPwd = !showPwd" />
              </template>
            </q-input>
            <q-input v-model="pwd.next" label="Password Baru" :type="showPwd ? 'text' : 'password'" filled class="serene-input" color="serene-primary" />
            <q-input v-model="pwd.confirm" label="Konfirmasi Password Baru" :type="showPwd ? 'text' : 'password'" filled class="serene-input" color="serene-primary" />
            <div class="col-span-2 row justify-end q-gutter-sm q-mt-sm">
              <q-btn label="Ubah Password" class="serene-btn-primary" :loading="pwdLoading" type="submit" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>

      <!-- Riwayat Video -->
      <q-card class="serene-card q-mb-lg">
        <q-card-section>
          <h2 class="headline-font section-h2 q-mb-md">Riwayat Video Pembelajaran</h2>
          <q-list bordered separator class="rounded-borders">
            <q-item v-for="item in history" :key="item.id" class="q-mb-sm hover-lift rounded-borders" clickable @click="openModule(item)">
              <q-item-section>
                <q-item-label class="text-bold">{{ item.module_detail?.title || 'Tanpa Judul' }}</q-item-label>
                <q-item-label caption class="text-serene-variant">{{ item.module_detail?.module_detail?.title || 'Tanpa Modul' }}</q-item-label>
                <q-item-label caption>{{ item.is_complete ? '✅ Selesai' : '⏳ Belum Selesai' }}</q-item-label>
                <q-linear-progress :value="item.duration ? item.last_position / item.duration : 0" color="serene-primary" rounded size="10px" class="q-mt-sm progress-glow" />
              </q-item-section>
            </q-item>
          </q-list>
          <q-btn
            v-if="hasMoreHistory" class="full-width q-mt-md serene-btn-ghost"
            label="Tampilkan lebih banyak" :loading="loadingHistory"
            :disable="loadingHistory" flat @click="loadVideoHistory"
          />
        </q-card-section>
      </q-card>

      <!-- Riwayat Quiz -->
      <q-card class="serene-card">
        <q-card-section>
          <h2 class="headline-font section-h2 q-mb-md">Riwayat Quiz</h2>
          <q-list bordered separator class="rounded-borders">
            <q-item v-for="quiz in groupedQuizzes" :key="quiz.quiz_id" class="q-mb-sm hover-lift rounded-borders" clickable @click="openAnswer(quiz)">
              <q-item-section>
                <q-item-label class="text-bold">{{ quiz.quiz_detail.question }}</q-item-label>
                <q-item-label caption class="text-serene-variant">{{ quiz.quiz_detail?.module_detail?.title }}</q-item-label>
                <q-item-label caption>{{ quiz.is_passed ? '✅ Selesai' : '⏳ Belum Selesai' }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useQuasar } from 'quasar'
import api from 'src/config/api'
import { authHeader } from 'src/config/auth'
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

const scrollToForm = () => {
  document.getElementById('profile-form')?.scrollIntoView({ behavior: 'smooth' })
}

const loadProfile = async () => {
  try {
    const res = await axios.get(`${API_BASE_URL}/profiles`, {
      headers: authHeader(),
      params: { user_id: userId }
    })
    const profile = res.data.data?.[0] || res.data[0]
    if (profile) {
      form.value = { ...form.value, ...profile, avatarFile: null }
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
        headers: { 'Content-Type': 'multipart/form-data', ...authHeader() }
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
    await axios.patch(`${API_BASE_URL}/profiles/${form.value.id}`, payload, { headers: authHeader() })
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
    }).onOk(() => { location.reload() })
  } catch (err) {
    console.error(err)
    $q.notify({ type: 'negative', message: 'Gagal memperbarui profil' })
  } finally {
    loading.value = false
  }
}

const showPwd = ref(false)
const pwdLoading = ref(false)
const pwd = ref({ current: '', next: '', confirm: '' })

const changePassword = async () => {
  if (pwd.value.next.length < 6) {
    $q.notify({ type: 'negative', message: 'Password baru minimal 6 karakter' })
    return
  }
  if (pwd.value.next !== pwd.value.confirm) {
    $q.notify({ type: 'negative', message: 'Konfirmasi password tidak cocok' })
    return
  }
  pwdLoading.value = true
  try {
    const check = await axios.post(`${API_BASE_URL}/authentication`, {
      strategy: 'local',
      email: JSON.parse(localStorage.getItem('email') || '""'),
      password: pwd.value.current
    })
    if (!check.data?.accessToken) throw new Error('Password saat ini salah')
    await axios.patch(`${API_BASE_URL}/users/${userId}`, { password: pwd.value.next }, { headers: authHeader() })
    $q.notify({ type: 'positive', message: 'Password berhasil diubah' })
    pwd.value = { current: '', next: '', confirm: '' }
  } catch (err) {
    console.error(err)
    const msg = err?.response?.data?.message || 'Gagal mengubah password'
    $q.notify({ type: 'negative', message: msg })
  } finally {
    pwdLoading.value = false
  }
}

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
      headers: authHeader(),
      params: { user_id: userId, $skip: skipHistory.value, $limit: limitHistory }
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

const groupedQuizzes = ref([])
const loadQuizHistory = async () => {
  try {
    const res = await axios.get(`${API_BASE_URL}/answers`, {
      headers: authHeader(),
      params: { $or: [{ user_id: userId }, { reply_to: userId }] }
    })
    const rawAnswers = res.data.data || res.data
    const quizMap = new Map()
    rawAnswers.forEach(answer => {
      const existing = quizMap.get(answer.quiz_id)
      if (!existing) quizMap.set(answer.quiz_id, answer)
      else if (answer.is_passed === 1) quizMap.set(answer.quiz_id, answer)
    })
    groupedQuizzes.value = Array.from(quizMap.values())
  } catch (err) {
    console.error('Gagal memuat riwayat quiz:', err)
    $q.notify({ type: 'negative', message: 'Gagal memuat riwayat quiz' })
  }
}

const openModule = (item) => { router.push(`/module/${item.parent_id}`) }
const openAnswer = (item) => { router.push(`/quiz-answer/${item.quiz_id}/${item.user_id}`) }

onMounted(() => { loadProfile(); loadVideoHistory(); loadQuizHistory() })
</script>

<style scoped>
.profile-container { max-width: 1280px; margin: 0 auto; }
.profile-page :deep(.q-page) { padding: 24px; }
.profile-header { border-radius: 16px; padding: 28px; }
.profile-header-inner { display: flex; align-items: center; gap: 24px; flex-wrap: wrap; }
.profile-avatar-wrap { position: relative; }
.profile-avatar { border: 4px solid #fff; }
.profile-edit-btn { position: absolute; bottom: 4px; right: 4px; }
.profile-name { font-size: 1.8rem; color: var(--serene-on-surface); }
.profile-role { font-size: 1rem; }
.stat-card { border-radius: 16px; padding: 24px; min-height: 110px; }
.serene-tertiary-card { background: var(--serene-tertiary); color: #fff; }
.serene-tertiary-card .text-serene-variant { color: #fff; opacity: .85; }
.section-h2 { font-size: 1.3rem; color: var(--serene-on-surface); }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.form-grid .col-span-2 { grid-column: span 2; }
.serene-input :deep(.q-field__control) { border-radius: 12px; }
.serene-btn-ghost { color: var(--serene-primary); }
.profile-avatar-sm { border-radius: 16px; }
@media (max-width: 1023px) {
  .form-grid { grid-template-columns: 1fr; }
  .form-grid .col-span-2 { grid-column: span 1; }
  .profile-header { padding: 20px; }
  .profile-header-inner { justify-content: center; text-align: center; }
  .profile-name { font-size: 1.4rem; }
  .stat-card { padding: 18px; }
  .serene-card { padding: 16px; }
}
</style>
