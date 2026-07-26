<template>
  <q-page class="bg-grey-2">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn flat round dense icon="arrow_back" @click="cancel" />
        <q-toolbar-title class="text-h6">
          {{ isEdit ? (form.role == 'santri' ? 'Edit Santri' : 'Edit Guru') : (form.role == 'santri' ? 'Tambah Santri' : 'Tambah Guru') }}
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <div class="q-pa-md form-container">
      <q-card class="form-card q-pa-md">
        <q-form @submit.prevent="submitForm" ref="formRef" class="q-gutter-y-md">
          <!-- Email Field -->
          <q-input
            v-model="form.email"
            label="Email"
            type="email"
            filled
            dense
            :error="emailError"
            :error-message="emailErrorMsg"
            @blur="validateEmail"
          />

          <!-- Password Field -->
          <q-input
            v-if="!isEdit"
            v-model="form.password"
            label="Password"
            type="password"
            filled
            dense
          />

          <!-- Display Name -->
          <q-input
            v-model="form.display_name"
            label="Nama Tampilan"
            filled
            dense
          />

          <!-- Job Title -->
          <q-input
            v-model="form.jobtitle"
            label="Pekerjaan / Kegiatan Saat Ini"
            filled
            dense
          />

          <!-- Role -->
          <q-select
            v-model="form.role"
            :options="roleOptions"
            label="Peran"
            filled
            dense
            emit-value
            map-options
            :rules="[val => !!val || 'Peran wajib dipilih']"
          />

          <!-- Avatar Section -->
          <div class="avatar-section">
            <div class="text-subtitle2 q-mb-sm">Foto Profil</div>
            
            <!-- Avatar Preview -->
            <div v-if="avatarPreview" class="avatar-preview-container q-mb-sm">
              <q-avatar size="100px" class="avatar-preview">
                <q-img :src="avatarPreview" />
                <q-btn 
                  round 
                  dense 
                  flat 
                  icon="close" 
                  class="avatar-remove-btn" 
                  @click="clearAvatar"
                />
              </q-avatar>
            </div>

            <!-- Uploader (Fungsionalitas tetap sama) -->
            <q-uploader
              ref="uploaderRef"
              label="Pilih file avatar"
              accept=".jpg, .jpeg, .png"
              :auto-upload="false"
              @added="onFileAdded"
              style="width: 100%"
              flat
              bordered
            />
            <div class="text-caption text-grey q-mt-xs">
              Format: JPG/PNG
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="row justify-end q-mt-lg q-gutter-sm">
            <q-btn label="Batal" color="grey" flat @click="cancel" />
            <q-btn 
              type="submit" 
              :label="isEdit ? 'Update' : 'Tambah'" 
              color="primary" 
              :loading="loading" 
            />
          </div>
        </q-form>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import axios from "axios";
import api from 'src/config/api'
import { authHeader } from 'src/config/auth'

const $q = useQuasar()
const router = useRouter()
const route = useRoute()

const loading = ref(false)
const uploaderRef = ref(null)
const formRef = ref(null)

const isEdit = computed(() => !!route.params.id)

const roleOptions = [
  { label: 'Guru', value: 'guru' },
  { label: 'Santri', value: 'santri' },
  { label: 'Admin', value: 'admin' }
]

const form = ref({
  id: null,
  user_id: null,
  email: '',
  password: '',
  display_name: '',
  jobtitle: '',
  file: null,
  avatar: '',
  role: 'guru'
})

// Avatar preview (fungsi tetap sama)
const avatarPreview = computed(() => {
  if (form.value.avatar) return `${api.API_UPLOADS_URL}/${form.value.avatar}`
  return null
})

const clearAvatar = () => {
  form.value.file = null
  form.value.avatar = ''
  if (uploaderRef.value) {
    uploaderRef.value.reset()
  }
}

const onFileAdded = (files) => {
  form.value.file = files[0]
}

// Email validation (fungsi tetap sama)
const emailError = ref(false)
const emailErrorMsg = ref('')

const checkEmailExists = async (email) => {
  try {
    const res = await fetch(`${api.API_BASE_URL}/users?email=${encodeURIComponent(email)}`, {
      headers: authHeader()
    })
    const data = await res.json()
    return Array.isArray(data.data) && data.data.length > 0
  } catch (err) {
    console.error('Gagal cek email:', err)
    return false
  }
}

const validateEmail = async () => {
  if (!form.value.email || isEdit.value) return
  const exists = await checkEmailExists(form.value.email)
  emailError.value = exists
  emailErrorMsg.value = exists ? 'Email sudah digunakan' : ''
}

// Submit form (fungsi tetap sama)
const submitForm = async () => {
  loading.value = true

  if (!isEdit.value) {
    const exists = await checkEmailExists(form.value.email)
    if (exists) {
      emailError.value = true
      emailErrorMsg.value = 'Email sudah digunakan'
      loading.value = false
      return
    }
  }

  try {
    let userId = form.value.id

    if (!isEdit.value) {
      const userRes = await fetch(`${api.API_BASE_URL}/users`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...authHeader()
        },
        body: JSON.stringify({
          email: form.value.email,
          password: form.value.password,
          role: form.value.role || 'guru'
        })
      })
      const user = await userRes.json()
      userId = user.id
      form.value.user_id = user.id
    } else {
      // Update email/role ke tabel users
      await fetch(`${api.API_BASE_URL}/users/${form.value.user_id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader()
        },
        body: JSON.stringify({
          email: form.value.email,
          role: form.value.role
        })
      })
    }

    let uploadedAvatar = form.value.avatar
    if (form.value.file) {
      const formData = new FormData()
      formData.append('file', form.value.file)

      const uploadRes = await fetch(`${api.API_BASE_URL}/uploads`, {
        method: 'POST',
        headers: authHeader(),
        body: formData
      })
      const upload = await uploadRes.json()
      uploadedAvatar = upload.filename
    }

    const profilePayload = {
      user_id: form.value.user_id || userId,
      display_name: form.value.display_name,
      jobtitle: form.value.jobtitle,
      avatar: uploadedAvatar
    }

    if (isEdit.value) {
      await fetch(`${api.API_BASE_URL}/profiles/${form.value.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader()
        },
        body: JSON.stringify(profilePayload)
      })
    } else {
      await fetch(`${api.API_BASE_URL}/profiles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader()
        },
        body: JSON.stringify(profilePayload)
      })
    }

    $q.notify({
      type: 'positive',
      message: 'Data berhasil disimpan',
      position: 'top'
    })
    
    router.back()

  } catch (err) {
    console.error(err)
    $q.notify({ 
      type: 'negative', 
      message: 'Gagal menyimpan data',
      position: 'top'
    })
  } finally {
    loading.value = false
  }
}

// Load data saat edit (fungsi tetap sama)
onMounted(async () => {
  const id = route.params.id
  if (id) {
    try {
      const res = await axios.get(`${api.API_BASE_URL}/profiles?user_id=${id}`, {
        headers: authHeader()
      });
      const data = res.data.data[0]
      
      form.value.id = data.id
      form.value.user_id = data.user?.id || id
      form.value.email = data.user?.email || ''
      form.value.display_name = data.display_name
      form.value.jobtitle = data.jobtitle
      form.value.avatar = data.avatar || ''
      form.value.role = data.user_role || data.user?.role || 'guru'

    } catch (err) {
      console.error('Gagal mengambil data:', err)
      $q.notify({
        type: 'negative',
        message: 'Gagal memuat data',
        position: 'top'
      })
    }
  }
})

const cancel = () => {
  router.back()
}
</script>

<style scoped>
.form-container {
  max-width: 600px;
  margin: 0 auto;
}

.form-card {
  border-radius: 8px;
}

.avatar-section {
  margin: 16px 0;
}

.avatar-preview-container {
  display: flex;
  justify-content: center;
}

.avatar-preview {
  position: relative;
  border: 1px solid #e0e0e0;
}

.avatar-remove-btn {
  position: absolute;
  top: -8px;
  right: -8px;
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}
</style>