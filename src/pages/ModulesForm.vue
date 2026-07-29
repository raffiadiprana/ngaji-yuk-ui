<template>
  <q-page class="module-form-page">
    <q-header elevated class="serene-header">
      <q-toolbar>
        <q-btn flat round dense icon="arrow_back" @click="goBack" />
        <q-toolbar-title>{{ isEdit ? 'Edit Materi Tajwid' : 'Input Materi Tajwid' }}</q-toolbar-title>
      </q-toolbar>
    </q-header>
    <div class="page-container">
      <div class="form-grid">
        <div class="form-main">
          <q-card class="form-card serene-card">
            <div class="card-title"><q-icon name="info" color="serene-primary" size="sm" class="q-mr-sm" />Informasi Dasar</div>
            <q-input filled v-model="form.title" label="Judul Materi" class="serene-input" />
            <div class="row q-col-gutter-md q-mt-sm">
              <div class="col-12 col-sm-6">
                <q-select filled v-model="form.section_id" :options="sectionsOptions" label="Section / Bab" class="serene-input" :rules="[val => val !== null && val !== undefined || 'Section wajib dipilih']" />
              </div>
              <div class="col-12 col-sm-6">
                <q-select filled v-model="form.category" :options="categoryOptions" label="Kategori" option-label="label" option-value="value" emit-value map-options class="serene-input" />
              </div>
            </div>
            <div class="row q-col-gutter-md q-mt-sm">
              <div class="col-6">
                <q-input filled type="number" v-model.number="form.order_index" label="Nomor Urut" class="serene-input" hint="Urutan materi dalam section ini" />
              </div>
            </div>
          </q-card>

          <q-card class="form-card serene-card">
            <div class="card-title"><q-icon name="visibility" color="serene-primary" size="sm" class="q-mr-sm" />Konten Visual</div>
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-7">
                <q-input filled type="textarea" v-model="form.arabic_text" label="Teks Arab" dir="rtl" class="serene-input serene-arabic" placeholder="أدخل النص العربي هنا..." autogrow />
                <q-input filled v-model="form.transliteration" label="Transliterasi" class="serene-input q-mt-sm" placeholder="e.g. Min Ba'di" />
                <q-input filled v-model="form.meaning" label="Makna (Terjemahan)" class="serene-input q-mt-sm" placeholder="Terjemahan bahasa Indonesia..." />
              </div>
              <div class="col-12 col-md-5">
                <div class="live-preview">
                  <div class="text-caption text-serene-variant q-mb-xs">Live Preview</div>
                  <div class="preview-box">
                    <div class="preview-arabic arabic-font" dir="rtl">{{ form.arabic_text || 'مِنْ بَعْدِ' }}</div>
                    <div class="preview-translit">{{ form.transliteration || 'Min Ba’di' }}</div>
                    <div class="preview-meaning">{{ form.meaning || 'After that' }}</div>
                  </div>
                </div>
              </div>
            </div>
          </q-card>

          <q-card class="form-card serene-card">
            <div class="card-title"><q-icon name="menu_book" color="serene-primary" size="sm" class="q-mr-sm" />Aturan Tajwid</div>
            <q-input filled type="textarea" v-model="form.description" label="Penjelasan Detail" class="serene-input" placeholder="Jelaskan aturan, posisi lidah, dan kesalahan umum..." autogrow />
            <q-input filled v-model="form.video_header_id" label="Video Pembelajaran (YouTube URL)" class="serene-input q-mt-sm" placeholder="https://www.youtube.com/watch?v=..." />
          </q-card>

          <q-card class="form-card serene-card">
            <div class="card-title"><q-icon name="auto_stories" color="serene-primary" size="sm" class="q-mr-sm" />Contoh Ayat Al-Quran</div>
            <q-input filled v-model="form.marked_ayah" label="Ayat Lengkap" class="serene-input" placeholder="Tempel ayat Al-Quran lengkap..." autogrow />
            <q-input filled v-model="form.highlight_words_input" label="Kata yang Disorot (pisah koma)" class="serene-input q-mt-sm" placeholder="contoh: نْ, لَهُ" />
          </q-card>

          <q-card class="form-card serene-card">
            <div class="card-title"><q-icon name="mic" color="serene-primary" size="sm" class="q-mr-sm" />Suara Guru</div>
            <div class="row q-col-gutter-sm">
              <div class="col-12 col-sm-6">
                <q-btn outline color="serene-primary" :label="recording ? 'Berhenti Rekam' : 'Rekam Suara'" class="q-mr-sm" @click="toggleRecord" :disable="uploading" />
              </div>
              <div class="col-12 col-sm-6">
                <q-file v-if="recordedBlob" filled v-model="audioFile" label="Ganti Audio" accept="audio/*" class="serene-input" />
              </div>
            </div>
            <div v-if="recordedBlob" class="q-mt-sm">
              <audio :src="recordedBlobUrl" controls class="q-mt-sm" style="width:100%" />
            </div>
          </q-card>

          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-card class="form-card serene-card attr-card">
                <div class="card-title"><q-icon name="tune" color="serene-primary" size="sm" class="q-mr-sm" />Atribut Tajwid</div>
                <div class="row items-center justify-between q-py-xs">
                  <div>
                    <div class="text-weight-medium text-serene-on-surface">Nasal Sound (Ghunnah)</div>
                    <div class="text-caption text-serene-variant">Aktifkan jika suara dari hidung</div>
                  </div>
                  <q-toggle v-model="form.ghunnah" color="serene-primary" />
                </div>
                <div class="q-py-xs">
                  <div class="text-weight-medium text-serene-on-surface q-mb-xs">Duration / Harakat</div>
                  <q-slider v-model="form.duration" :min="1" :max="6" label :label-value="`${form.duration} Beats`" color="serene-primary" />
                </div>
              </q-card>
            </div>
            <div class="col-12 col-md-6">
              <q-card class="form-card serene-card attr-card">
                <div class="card-title"><q-icon name="graphic_eq" color="serene-primary" size="sm" class="q-mr-sm" />Media Referensi</div>
                <q-file filled v-model="thumbnailFile" label="Unggah Audio/Thumb" accept=".mp3,.wav,.jpg,.png" class="serene-input" @update:model-value="onFileChange">
                  <template v-slot:prepend><q-icon name="attach_file" /></template>
                </q-file>
                <div v-if="thumbnailPreview" class="q-mt-sm">
                  <q-img :src="thumbnailPreview" style="max-height:90px;border-radius:12px;" />
                </div>
                <div v-else class="upload-zone q-mt-sm">
                  <q-icon name="cloud_upload" size="32px" color="serene-primary" />
                  <div class="text-caption text-serene-variant q-mt-xs">Drag & drop file (MP3, WAV, JPG, PNG)</div>
                </div>
              </q-card>
            </div>
          </div>
        </div>
      </div>

      <div class="action-bar">
        <q-btn label="Batal" color="grey" flat @click="cancel" class="q-mr-sm" />
        <q-btn label="Simpan Draft" outline class="serene-btn-ghost q-mr-sm" :loading="loading" @click="submitForm('draft')" />
        <q-btn :label="isEdit ? 'Update' : 'Terbitkan Materi'" class="serene-btn-primary" :loading="loading" @click="submitForm('publish')" />
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { useQuasar } from 'quasar'
const $q = useQuasar()
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'
import api from 'src/config/api'
import { authHeader } from 'src/config/auth'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const sectionsOptions = ref([])
const thumbnailFile = ref(null)
const thumbnailPreview = ref(null)
const recording = ref(false)
const uploading = ref(false)
const recordedBlob = ref(null)
const audioFile = ref(null)
const recordedBlobUrl = computed(() => recordedBlob.value ? URL.createObjectURL(recordedBlob.value) : '')

const categoryOptions = [
  { label: 'Core (Fondasi)', value: 'core' },
  { label: 'Advanced', value: 'advanced' },
  { label: 'Reference', value: 'reference' },
]

const form = ref({
  id: null,
  title: '',
  description: '',
  arabic_text: '',
  transliteration: '',
  meaning: '',
  video_header_id: '',
  thumbnail: '',
  section_id: null,
  category: 'core',
  order_index: 0,
  ghunnah: false,
  duration: 2,
  instructor_id: localStorage.getItem('id') || null,
  marked_ayah: '',
  highlight_words_input: '',
  voice_note_url: ''
})

const isEdit = computed(() => !!form.value.id)
const goBack = () => router.go(-1)
const cancel = () => router.back()

const onFileChange = (files) => {
  const f = Array.isArray(files) ? files[0] : files
  if (f && f.type && f.type.startsWith('image')) {
    thumbnailPreview.value = URL.createObjectURL(f)
  } else {
    thumbnailPreview.value = null
  }
}

const uploadFile = async () => {
  if (!thumbnailFile.value) return
  const fd = new FormData()
  fd.append('file', thumbnailFile.value)
  const res = await axios.post(`${api.API_BASE_URL}/uploads`, fd, {
    headers: { 'Content-Type': 'multipart/form-data', ...authHeader() }
  })
  form.value.thumbnail = res.data.filename
}

const toggleRecord = async () => {
  if (recording.value) {
    recording.value = false
    window.__currentRecorder?.stop()
    return
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const recorder = new MediaRecorder(stream)
    const chunks = []
    recorder.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data) }
    recorder.onstop = () => {
      stream.getTracks().forEach(t => t.stop())
      recordedBlob.value = new Blob(chunks, { type: 'audio/webm' })
    }
    recorder.start()
    recording.value = true
    window.__currentRecorder = recorder
  } catch (e) {
    $q.notify({ type: 'negative', message: 'Microphone access denied' })
  }
}

const submitForm = async (mode) => {
  if (mode === 'publish' && !form.value.title) {
    $q.notify({ type: 'warning', message: 'Judul wajib diisi' })
    return
  }
  loading.value = true
  try {
    if (thumbnailFile.value) await uploadFile()
    if (audioFile.value) {
      uploading.value = true
      const fd = new FormData()
      fd.append('file', audioFile.value)
      const res = await axios.post(`${api.API_BASE_URL}/uploads`, fd, {
        headers: { 'Content-Type': 'multipart/form-data', ...authHeader() }
      })
      form.value.voice_note_url = res.data.filename
      uploading.value = false
    }
    const payload = {
      title: form.value.title,
      description: form.value.description || '',
      arabic_text: form.value.arabic_text,
      transliteration: form.value.transliteration,
      meaning: form.value.meaning,
      video_header_id: form.value.video_header_id,
      thumbnail: form.value.thumbnail,
      section_id: Number(form.value.section_id),
      category: form.value.category,
      order_index: Number(form.value.order_index),
      instructor_id: Number(form.value.instructor_id),
      is_draft: mode === 'draft' ? 1 : 0,
      marked_ayah: form.value.marked_ayah || '',
      highlight_words: form.value.highlight_words_input
        ? form.value.highlight_words_input.split(',').map(s => s.trim()).filter(Boolean)
        : [],
      ghunnah: form.value.ghunnah || false,
      duration: Number(form.value.duration || 2),
      voice_note_url: form.value.voice_note_url || ''
    }
    if (isEdit.value) {
      await axios.patch(`${api.API_BASE_URL}/modules/${form.value.id}`, payload, { headers: authHeader() })
    } else {
      await axios.post(`${api.API_BASE_URL}/modules`, payload, { headers: authHeader() })
    }
    $q.dialog({ title: 'Berhasil', message: 'Data berhasil disimpan.', ok: { label: 'OK', color: 'primary' } }).onOk(() => router.back())
  } catch (error) {
    console.error('Gagal simpan materi:', error)
    console.error('[ModulesForm] full error data:', JSON.stringify(error.response?.data || error.message, null, 2))
    $q.notify({ type: 'negative', message: 'Gagal menyimpan materi.' })
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  const res = await axios.get(`${api.API_BASE_URL}/sections`, { headers: authHeader() })
  sectionsOptions.value = (res.data.data || []).map(s => ({ label: s.section_name, value: s.id }))
  if (route.query.section_id) form.value.section_id = Number(route.query.section_id)
  if (route.query.id) {
    const detail = await axios.get(`${api.API_BASE_URL}/modules/${route.query.id}`, { headers: authHeader() })
    form.value = detail.data.data || form.value
  }
})
</script>

<style scoped>
.module-form-page { background: var(--serene-bg); min-height: 100vh; }
.page-container { max-width: 960px; margin: 0 auto; padding: 24px 20px; }
.form-grid { display: grid; gap: 20px; }
.form-main { display: flex; flex-direction: column; gap: 16px; }
.form-card { border-radius: 16px; padding: 18px; }
.card-title { font-weight: 600; color: var(--serene-on-surface); margin-bottom: 10px; display: inline-flex; align-items: center; gap: 8px; }
.serene-input :deep(.q-field__control) { border-radius: 12px; }
.live-preview .preview-box { border-radius: 16px; padding: 20px; background: var(--serene-surface-container-low); border: 1px solid var(--serene-border); }
.preview-arabic { font-family: 'Noto Serif Arabic', serif; font-size: 28px; line-height: 48px; text-align: right; }
.preview-translit { color: var(--serene-on-surface-variant); margin-top: 6px; }
.preview-meaning { color: var(--serene-on-surface); margin-top: 2px; }
.upload-zone { border-radius: 16px; padding: 24px; border: 1px dashed var(--serene-outline-variant); background: var(--serene-surface-container-low); text-align: center; }
.action-bar { display: flex; justify-content: flex-end; gap: 10px; margin-top: 8px; }
.serene-btn-ghost { color: var(--serene-primary); }
@media (max-width: 1023px) {
  .page-container { padding: 16px 14px; }
}
</style>
