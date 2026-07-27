<template>
    <q-page class="lesson-form-page">
      <div class="aurora-bg" aria-hidden="true">
        <span class="aurora a1" />
        <span class="aurora a2" />
        <span class="aurora a3" />
      </div>

      <q-header elevated class="bg-green-gradient text-white serene-header">
        <q-toolbar>
          <q-btn flat round dense icon="arrow_back" @click="goBack" />
          <q-toolbar-title>{{ form.title || 'Tambah Materi Tajwid' }}</q-toolbar-title>
        </q-toolbar>
      </q-header>

      <div class="page-container">
        <q-card class="my-card serene-card">
          <q-card-section>
            <q-form @submit.prevent="submitForm" ref="formRef" class="q-gutter-md">
              <q-input
                filled
                v-model="form.title"
                label="Judul Pelatihan"
                :rules="[val => !!val || 'Judul wajib diisi']"
              />

              <q-select
                filled
                v-model="form.module_id"
                :options="modulesOptions"
                label="Module"
                option-label="title"
                option-value="id"
                :rules="[val => val !== null && val !== undefined || 'Module wajib dipilih']"
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
                label="Video URL"
                placeholder="URL Video"
              />

              <!-- Thumbnail Preview -->
              <q-img
                v-if="thumbnailPreview"
                :src="thumbnailPreview"
                alt="Thumbnail Preview"
                class="q-mb-md"
                style="max-width: 200px; border-radius: 8px;"
              />

              <!-- Tombol Hapus Thumbnail -->
              <q-btn
                v-if="thumbnailPreview"
                label="Hapus Gambar"
                color="negative"
                flat
                icon="delete"
                class="q-mb-md"
                @click="clearThumbnail"
              />

              <!-- Upload Thumbnail -->
              <q-uploader
                filled
                style="padding-right: 15px;"
                v-model="form.thumbnailFile"
                label="Thumbnail"
                accept="image/*"
                @added="onThumbnailFileChange"
                :rules="[val => !!thumbnailPreview || 'Thumbnail wajib dipilih']"
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
  const modulesOptions = ref([])
  const userId = Number(localStorage.getItem('id'));
  
  const form = ref({
    id: null,
    title: '',
    description: '',
    video_header_id: '',
    thumbnail: '',
    thumbnailFile: null,
    module_id: null,
    created_by: userId
  })
  
  const isEdit = computed(() => !!form.value.id)
  const goBack = () => router.go(-1)
  const cancel = () => router.back()
  
  // Preview thumbnail logic
  const thumbnailPreview = computed(() => {
    if (form.value.thumbnail) {
      return `${api.API_UPLOADS_URL}/${form.value.thumbnail}`
    }
    return null
  })
  
  // Bersihkan ObjectURL jika file berubah
  watch(() => form.value.thumbnailFile, (newVal, oldVal) => {
    if (oldVal && typeof oldVal === 'object') {
      URL.revokeObjectURL(oldVal)
    }
  })
  
  // Hapus thumbnail
  const clearThumbnail = () => {
    form.value.thumbnailFile = null
    form.value.thumbnail = ""
  }
  
  // Saat file baru dipilih
  const onThumbnailFileChange = (files) => {
    form.value.thumbnailFile = files[0]
  }
  
  // Upload file
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
  
  // Submit form
  const submitForm = async () => {
    if (!formRef.value.validate()) return
  
    loading.value = true
    try {
      if (form.value.thumbnailFile) {
        await uploadThumbnail()
      }
  
      const payload = {
        title: form.value.title,
        description: form.value.description,
        video_header_id: form.value.video_header_id,
        thumbnail: form.value.thumbnail,
        module_id: form.value.module_id,
        created_by: form.value.created_by
      }
  
      if (isEdit.value) {
        await axios.patch(`${api.API_BASE_URL}/lessons/${form.value.id}`, payload, {
          headers: authHeader(),
        })
      } else {
        await axios.post(`${api.API_BASE_URL}/lessons`, payload, {
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
      console.error('Failed to save lesson:', error)
    } finally {
      loading.value = false
    }
  }
  
  // Load data
  onMounted(async () => {
    try {
      const res = await axios.get(`${api.API_BASE_URL}/modules`, {
        headers: authHeader(),
        params: { instructor_id: localStorage.getItem('id') },
      })
      modulesOptions.value = res.data.data
    } catch (error) {
      console.error('Failed to fetch modules:', error)
    }
  
    const id = route.params.id
    if (id) {
      try {
        const res = await axios.get(`${api.API_BASE_URL}/lessons/${id}`, {
          headers: authHeader(),
        })
        const data = res.data
        form.value.id = data.id
        form.value.title = data.title
        form.value.description = data.description
        form.value.video_header_id = data.video_header_id || ''
        form.value.thumbnail = data.thumbnail || ''
        form.value.module_id = data.module_id
      } catch (error) {
        console.error('Failed to fetch lesson data:', error)
      }
    }
  })
  </script>
  
  <style scoped>
    .lesson-form-page {
      min-height: 100vh;
      background: var(--serene-bg);
      position: relative;
    }
    .aurora-bg {
      position: fixed;
      inset: 0;
      overflow: hidden;
      z-index: 0;
      pointer-events: none;
    }
    .aurora {
      position: absolute;
      border-radius: 50%;
      filter: blur(70px);
      opacity: 0.25;
    }
    .aurora.a1 { width: 420px; height: 420px; background: var(--serene-primary); top: -120px; left: -100px; }
    .aurora.a2 { width: 360px; height: 360px; background: var(--serene-secondary); bottom: -120px; right: -80px; }
    .aurora.a3 { width: 300px; height: 300px; background: #a7f3d0; top: 40%; left: 60%; }

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
  