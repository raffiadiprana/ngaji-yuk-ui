<template>
  <q-page padding>
    <!-- Header -->
    <q-header elevated class="bg-green-gradient text-white">
      <q-toolbar>
        <q-btn flat round dense icon="arrow_back" @click="goBack" />
        <q-toolbar-title>{{ form.title || 'Tambah Quiz' }}</q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-card class="my-card">
      <q-card-section>
        <q-form @submit.prevent="submitForm" ref="formRef" class="q-gutter-md">
          <!-- Module Select -->
          <q-select
            filled
            v-model="form.modules_id"
            :options="modulesOptions"
            label="Module"
            option-label="title"
            option-value="id"
            :rules="[val => val !== null && val !== undefined || 'Module wajib dipilih']"
            emit-value
            map-options
          />

          <!-- Question -->
          <q-input
            filled
            v-model="form.question"
            label="Soal Quiz"
            :rules="[val => !!val || 'Soal quiz wajib diisi']"
            type="textarea"
            rows="4"
          />

          <!-- File Preview -->
          

         

          <div class="row justify-end q-gutter-sm q-mt-md">
            <q-btn label="Batal" color="grey" flat @click="cancel" />
            <q-btn type="submit" :label="isEdit ? 'Update' : 'Tambah'" color="primary" :loading="loading" />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { useQuasar } from 'quasar'
import { ref, computed, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import axios from "axios";
import api from "src/config/api"
import { authHeader } from "src/config/auth";

const $q = useQuasar()
const router = useRouter()
const route = useRoute()

const loading = ref(false)
const formRef = ref(null)
const modulesOptions = ref([])

const form = ref({
  id: null,
  question: "",
  modules_id: null,
  file: null,
  media_id: '',
  instructor_id: localStorage.getItem("id") || null,
})

const isEdit = computed(() => !!form.value.id)
const goBack = () => router.go(-1)
const cancel = () => router.back()

// Preview file URL
const filePreviewUrl = computed(() => {
  if (form.value.media_id) {
    return `${api.API_UPLOADS_URL}/${form.value.media_id}`
  }
  return null
})

// Cleanup object URL
watch(() => form.value.file, (newVal, oldVal) => {
  if (oldVal && typeof oldVal === 'object') {
    URL.revokeObjectURL(oldVal)
  }
})

// Reset file
const clearFile = () => {
  form.value.file = null
  form.value.media_id = ''
}

// Handle new file added
const onFileChange = (files) => {
  form.value.file = files[0]
}

// Load module list
const fetchModules = async () => {
  try {
    const res = await axios.get(`${api.API_BASE_URL}/modules`, {
      headers: { ...authHeader(),},
      params: { instructor_id: form.value.instructor_id },
    });
    modulesOptions.value = res.data.data || []
  } catch (err) {
    console.error("Error fetching modules:", err)
  }
}

// Load quiz data if edit
const fetchQuizData = async () => {
  const id = route.params.id
  if (id) {
    loading.value = true
    try {
      const res = await axios.get(`${api.API_BASE_URL}/quiz/${id}`, {
        headers: authHeader(),
      });
      const data = res.data
      form.value.id = data.id
      form.value.question = data.question
      form.value.modules_id = data.modules_id
      form.value.instructor_id = data.instructor_id
      form.value.media_id = data.media_id || ''
    } catch (err) {
      console.error("Error fetching quiz data:", err)
    } finally {
      loading.value = false
    }
  }
}

// Save quiz
const submitForm = async () => {
  if (!formRef.value.validate()) return

  loading.value = true
  try {
    const payload = {
      question: form.value.question,
      modules_id: form.value.modules_id,
      created_by: Number(localStorage.getItem("id")),
    }

    if (form.value.file) {
      const formData = new FormData()
      formData.append("file", form.value.file)

      const fileRes = await axios.post(`${api.API_BASE_URL}/uploads`, formData, {
        headers: {
          "Content-Type": "multipart/form-data", ...authHeader(),
        },
      })
      payload.media_id = fileRes.data.filename
    } else {
      payload.media_id = form.value.media_id
    }

    if (isEdit.value) {
      await axios.patch(`${api.API_BASE_URL}/quiz/${form.value.id}`, payload, {
        headers: authHeader(),
      })
    } else {
      await axios.post(`${api.API_BASE_URL}/quiz`, payload, {
        headers: authHeader(),
      })
    }

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
  } catch (err) {
    console.error("Error saving quiz:", err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchModules()
  fetchQuizData()
})
</script>

<style scoped>
.my-card {
  max-width: 600px;
  margin: auto;
}
</style>
