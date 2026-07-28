<template>
  <q-page class="module-form-page">

    <q-header elevated class="serene-header">
      <q-toolbar>
        <q-btn flat round dense icon="arrow_back" @click="goBack" />
        <q-toolbar-title>{{ form.title || 'Tambah Modul' }}</q-toolbar-title>
      </q-toolbar>
    </q-header>

    <div class="page-container">
      <q-card class="my-card serene-card">
        <q-card-section>
          <q-form @submit.prevent="submitForm" ref="formRef" class="q-gutter-md">
            <q-input
              filled
              v-model="form.title"
              label="Judul Materi"
              :rules="[val => !!val || 'Judul wajib diisi']"
            />

            <q-select
              filled
              v-model="form.section_id"
              :options="sectionsOptions"
              label="Section"
              option-label="section_name"
              option-value="id"
              :rules="[val => val !== null && val !== undefined || 'Section wajib dipilih']"
              emit-value
              map-options
            />

            <q-input
              filled
              type="textarea"
              v-model="form.description"
              label="Deskripsi"
              placeholder="Opsional"
              autogrow
            />

            <q-input
              filled
              v-model="form.video_header_id"
              label="Video Header"
              placeholder="Opsional"
            />

            <div class="row justify-end q-gutter-sm q-mt-md">
              <q-btn label="Batal" color="grey" flat @click="cancel" />
              <q-btn type="submit" :label="isEdit ? 'Update' : 'Tambah'" class="serene-btn-primary" :loading="loading" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { useQuasar } from 'quasar'
const $q = useQuasar()
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'
import api from 'src/config/api'
import { authHeader } from 'src/config/auth'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const formRef = ref(null)
const sectionsOptions = ref([])

const form = ref({
  id: null,
  title: "",
  description: "",
  video_header_id: "",
  thumbnail: "",
  thumbnailFile: null,
  section_id: null,
  instructor_id: localStorage.getItem('id') || null,
})

const isEdit = computed(() => !!form.value.id)
const goBack = () => router.go(-1)
const cancel = () => router.back()

// Thumbnail preview (from existing or newly uploaded file)
const thumbnailPreview = computed(() => {
  if (form.value.thumbnail) {
    return `${api.API_UPLOADS_URL}/${form.value.thumbnail}`
  }
  return null
})

// Clean up object URL if file changes
watch(() => form.value.thumbnailFile, (newVal, oldVal) => {
  if (oldVal && typeof oldVal === 'object') {
    URL.revokeObjectURL(oldVal)
  }
})

// Clear thumbnail (preview and value)
const clearThumbnail = () => {
  form.value.thumbnailFile = null
  form.value.thumbnail = ""
}

// Handle new file selected
const onThumbnailFileChange = (files) => {
  form.value.thumbnailFile = files[0]
}

// Upload thumbnail before saving
const uploadThumbnail = async () => {
  const formData = new FormData()
  formData.append('file', form.value.thumbnailFile)

  const response = await axios.post(`${api.API_BASE_URL}/uploads`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      ...authHeader()
    }
  })

  form.value.thumbnail = response.data.filename
}

const submitForm = async () => {
  if (!formRef.value.validate()) return

  loading.value = true
  try {
    if (form.value.thumbnailFile) {
      await uploadThumbnail()
    }

    const payload = {
      title: form.value.title,
      description: form.value.description || "",
      video_header_id: form.value.video_header_id,
      thumbnail: form.value.thumbnail,
      section_id: Number(form.value.section_id),
      instructor_id: Number(form.value.instructor_id)
    }

    if (isEdit.value) {
      await axios.patch(`${api.API_BASE_URL}/modules/${form.value.id}`, payload, {
        headers: authHeader(),
      })
    } else {
      await axios.post(`${api.API_BASE_URL}/modules/`, payload, {
        headers: authHeader(),
      })
    }

    // Tampilkan dialog berhasil
    $q.dialog({
      title: 'Berhasil',
      message: 'Data berhasil disimpan.',
      ok: {
        label: 'OK',
        color: 'primary'
      }
    }).onOk(() => {
      router.back()
    })

  } catch (error) {
    console.error('Gagal simpan materi:', error)
  } finally {
    loading.value = false
  }
}


onMounted(async () => {
  try {
    const res = await axios.get(`${api.API_BASE_URL}/sections`, {
      headers: authHeader(),
    })
    sectionsOptions.value = res.data?.data ?? []
    console.log('[ModulesForm] sections loaded:', sectionsOptions.value.length)
  } catch (error) {
    console.error('[ModulesForm] Gagal ambil sections:', error)
    $q.notify({ type: 'negative', message: 'Gagal memuat daftar section' })
  }

  const id = route.params.id
  if (id) {
    try {
      const res = await axios.get(`${api.API_BASE_URL}/modules/${id}`, {
        headers: authHeader(),
      })
      const data = res.data
      form.value.id = data.id
      form.value.title = data.title
      form.value.description = data.description
      form.value.video_header_id = data.video_header_id || ''
      form.value.thumbnail = data.thumbnail || ''
      form.value.section_id = data.section_id
      form.value.instructor_id = data.instructor_id || form.value.instructor_id
    } catch (error) {
      console.error('Gagal ambil data materi:', error)
    }
  } else if (route.query.section_id) {
    // Dibuka dari roadmap "Tambah Materi" -> auto-pilih section
    form.value.section_id = Number(route.query.section_id)
  }
})
</script>

<style scoped>
.module-form-page {
  min-height: 100vh;
  background: var(--serene-bg);
  position: relative;
}

.page-container {
  position: relative;
  z-index: 1;
  padding: 24px 16px;
}

.my-card {
  max-width: 600px;
  margin: auto;
  border-radius: 16px;
}
</style>
