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
        <!-- Main column -->
        <div class="form-main">
          <!-- Basic Info -->
          <q-card class="form-card serene-card">
            <div class="card-title"><q-icon name="info" color="serene-primary" size="sm" class="q-mr-sm" />Basic Info</div>
            <q-input filled v-model="form.title" label="Judul Materi" class="serene-input" :rules="[val => !!val || 'Judul wajib diisi']" />
            <div class="row q-col-gutter-md q-mt-sm">
              <div class="col-12 col-sm-6">
                <q-select filled v-model="form.section_id" :options="sectionsOptions" label="Section" option-label="section_name" option-value="id" emit-value map-options class="serene-input" :rules="[val => val !== null && val !== undefined || 'Section wajib dipilih']" />
              </div>
              <div class="col-12 col-sm-6">
                <q-select filled v-model="form.category" :options="categoryOptions" label="Kategori" option-label="label" option-value="value" emit-value map-options class="serene-input" />
              </div>
            </div>
            <div class="row q-col-gutter-md q-mt-sm">
              <div class="col-6">
                <q-input filled type="number" v-model.number="form.order_index" label="Nomor Urut" class="serene-input" hint="Untuk urutan materi dalam kategori" />
              </div>
            </div>
          </q-card>

          <!-- Visual Content -->
          <q-card class="form-card serene-card">
            <div class="card-title"><q-icon name="visibility" color="serene-primary" size="sm" class="q-mr-sm" />Konten Visual</div>
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-7">
                <q-input filled type="textarea" v-model="form.arabic_text" label="Teks Arab" dir="rtl" class="serene-input serene-arabic" placeholder="أدخل النص العربي هنا..." autogrow />
                <q-input filled v-model="form.transliteration" label="Transliterasi" class="serene-input q-mt-sm" placeholder="e.g. Min Ba'di" />
                <q-input filled v-model="form.meaning" label="Makna (Terjemahan)" class="serene-input q-mt-sm" placeholder="e.g. After that" />
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

          <!-- The Rule -->
          <q-card class="form-card serene-card">
            <div class="card-title"><q-icon name="menu_book" color="serene-primary" size="sm" class="q-mr-sm" />The Rule</div>
            <q-input filled type="textarea" v-model="form.description" label="Penjelasan Detail" class="serene-input" placeholder="Jelaskan aturan, posisi lidah, dan kesalahan umum..." autogrow />
            <q-input filled v-model="form.video_header_id" label="Video Header (YouTube URL)" class="serene-input q-mt-sm" placeholder="Opsional" />
          </q-card>

          <!-- Attributes & Media -->
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

      <!-- Sticky action bar -->
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

const submitForm = async (mode) => {
  if (mode === 'publish' && !form.value.title) {
    $q.notify({ type: 'warning', message: 'Judul wajib diisi' })
    return
  }
  loading.value = true
  try {
    if (thumbnailFile.value) await uploadFile()
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
    }
    if (isEdit.value) {
      await axios.patch(`${api.API_BASE_URL}/modules/${form.value.id}`, payload, { headers: authHeader() })
    } else {
      await axios.post(`${api.API_BASE_URL}/modules/`, payload, { headers: authHeader() })
    }
    $q.dialog({ title: 'Berhasil', message: 'Data berhasil disimpan.', ok: { label: 'OK', color: 'primary' } }).onOk(() => router.back())
  } catch (error) {
    console.error('Gagal simpan materi:', error)
    $q.notify({ type: 'negative', message: 'Gagal menyimpan materi.' })
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  try {
    const res = await axios.get(`${api.API_BASE_URL}/sections`, { headers: authHeader() })
    sectionsOptions.value = (res.data?.data ?? []).sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
  } catch (e) { console.error(e) }

  const id = route.params.id
  if (id) {
    try {
      const res = await axios.get(`${api.API_BASE_URL}/modules/${id}`, { headers: authHeader() })
      const d = res.data
      form.value.id = d.id
      form.value.title = d.title
      form.value.description = d.description
      form.value.arabic_text = d.arabic_text || ''
      form.value.transliteration = d.transliteration || ''
      form.value.meaning = d.meaning || ''
      form.value.video_header_id = d.video_header_id || ''
      form.value.thumbnail = d.thumbnail || ''
      form.value.section_id = d.section_id
      form.value.category = d.category || 'core'
      form.value.order_index = d.order_index || 0
      form.value.instructor_id = d.instructor_id || form.value.instructor_id
    } catch (e) { console.error(e) }
  } else if (route.query.section_id) {
    form.value.section_id = Number(route.query.section_id)
  }
})
</script>

<style scoped>
.module-form-page { min-height: 100vh; background: var(--serene-bg); }
.page-container { max-width: 900px; margin: 0 auto; padding: 24px 16px 100px; }
.form-grid { display: block; }
.form-card { border-radius: 16px; padding: 20px 24px; margin-bottom: 20px; }
.form-main { display: block; }
.card-title { font-weight: 700; color: var(--serene-on-surface); margin-bottom: 14px; display: flex; align-items: center; }
.serene-input { background: var(--serene-surface); border-radius: 12px; }
.serene-arabic :deep(.q-field__native) { font-family: 'Noto Serif', serif; font-size: 1.3rem; }
.attr-card { height: 100%; }
.live-preview { }
.preview-box { background: var(--serene-surface); border-radius: 12px; padding: 16px; text-align: center; min-height: 140px; display: flex; flex-direction: column; justify-content: center; }
.preview-arabic { font-size: 2rem; color: var(--serene-on-surface); line-height: 1.8; }
.preview-translit { font-size: 0.9rem; color: var(--serene-primary); font-weight: 600; margin-top: 6px; }
.preview-meaning { font-size: 0.85rem; color: var(--serene-variant); }
.upload-zone { border: 1.5px dashed var(--serene-outline-variant); border-radius: 12px; padding: 18px; text-align: center; }
.action-bar { position: fixed; bottom: 0; left: 0; right: 0; background: var(--serene-surface); border-top: 1px solid var(--serene-border); padding: 12px 16px; display: flex; justify-content: flex-end; align-items: center; z-index: 50; }
.serene-btn-ghost { color: var(--serene-primary); border-color: var(--serene-primary); }
@media (min-width: 600px) {
  .page-container { padding: 32px 24px 110px; }
}
@media (min-width: 1024px) {
  .page-container { padding: 40px 0 110px; }
}
</style>
