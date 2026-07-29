<template>
  <q-page padding class="donations-page">
    <div class="page-container q-pa-md">
      <div class="welcome-section serene-card">
        <div class="welcome-content">
          <h4 class="welcome-title">Form Donasi</h4>
          <p class="welcome-subtitle">Kirim bukti transfer untuk mendukung perkembangan aplikasi.</p>
        </div>
      </div>

      <div class="row q-col-gutter-lg">
        <div class="col-12 col-md-5">
          <q-card class="serene-card q-pa-md">
            <q-card-section>
              <q-form @submit.prevent="submitForm" ref="formRef" class="q-gutter-md">
                <q-input v-model="form.account_name" label="Nama Pemilik Rekening" filled class="serene-input" color="serene-primary" />
                <q-input v-model="form.bank_name" label="Nama Bank Asal" filled class="serene-input" color="serene-primary" />
                <q-input v-model="form.source_bank" label="Nomor Rekening Bank Asal" filled class="serene-input" color="serene-primary" />
                <q-input
                  v-model="form.amount"
                  label="Nominal Transfer"
                  type="number"
                  filled
                  prefix="Rp"
                  class="serene-input"
                  color="serene-primary"
                />

                <q-uploader
                  label="Upload Bukti Transfer"
                  v-model="form.proof"
                  accept="image/*"
                  @added="onFileChange"
                  :auto-upload="false"
                  class="q-mt-md serene-uploader"
                />

                <div class="row justify-end q-gutter-sm q-mt-md">
                  <q-btn label="Kirim Donasi" class="serene-btn-primary" type="submit" :loading="loading" />
                </div>
              </q-form>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-md-7">
          <q-card class="serene-card q-pa-md">
            <q-card-section>
              <div class="text-h6 q-mb-md text-serene-on-surface">Riwayat Donasi Anda</div>

              <div v-if="loadingHistory" class="text-center q-py-md text-serene-variant">
                Memuat riwayat...
              </div>

              <div v-else-if="history.length === 0" class="empty-state text-serene-variant q-py-lg text-center">
                Belum ada donasi.
              </div>

              <q-list v-else bordered separator>
                <q-item v-for="item in history" :key="item.id" class="q-mb-sm">
                  <q-item-section avatar>
                    <q-avatar rounded size="56px">
                      <q-img :src="`${API_UPLOADS_URL}/${item.proof_image}`" />
                    </q-avatar>
                  </q-item-section>

                  <q-item-section>
                    <q-item-label class="text-bold text-serene-on-surface">{{ item.account_name }}</q-item-label>
                    <q-item-label caption class="text-serene-variant">
                      {{ item.bank_name }} - {{ item.source_bank }}
                    </q-item-label>
                    <q-item-label caption class="text-serene-primary">
                      Rp {{ Number(item.amount).toLocaleString('id-ID') }}
                    </q-item-label>
                    <q-item-label caption class="text-serene-variant">
                      {{ formatDate(item.created_at) }}
                    </q-item-label>

                    <q-badge
                      outline
                      :color="item.is_verified == 1 ? 'green' :
                              item.is_verified == 2 ? 'red' : 'orange'"
                      class="q-mt-sm"
                      align="left"
                    >
                      {{ item.is_verified == 1 ? 'Terverifikasi' :
                              item.is_verified == 2 ? 'Ditolak' : 'Menunggu Verifikasi' }}
                    </q-badge>

                    <div v-if="item.reject_reason" class="text-negative q-mt-sm">
                      Alasan Penolakan: {{ item.reject_reason }}
                    </div>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import api from 'src/config/api'
import { authHeader } from 'src/config/auth'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const formRef = ref(null)
const loading = ref(false)
const loadingHistory = ref(false)

const API_BASE_URL = api.API_BASE_URL
const API_UPLOADS_URL = api.API_UPLOADS_URL
const userId = localStorage.getItem('id')

const form = ref({
  account_name: '',
  bank_name: '',
  source_bank: '',
  amount: '',
  proof: null,
  is_verified: 0
})

const history = ref([])

const onFileChange = (files) => {
  form.value.proof = files[0]
}

const formatDate = (date) => {
  return new Date(date).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const submitForm = async () => {
  if (!formRef.value.validate()) return
  loading.value = true

  try {
    let proofFilename = ''
    if (form.value.proof) {
      const formData = new FormData()
      formData.append('file', form.value.proof)
      const res = await axios.post(`${API_BASE_URL}/uploads`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
      ...authHeader()}
      })
      proofFilename = res.data.filename
    }

    await axios.post(`${API_BASE_URL}/donations`, {
      user_id: Number(userId),
      account_name: form.value.account_name,
      bank_name: form.value.bank_name,
      source_bank: form.value.source_bank,
      amount: Number(form.value.amount),
      proof_image: proofFilename,
      is_verified : form.value.is_verified
    }, {
      headers: {
        headers: authHeader()
      }
    })

    $q.notify({ type: 'positive', message: 'Donasi berhasil dikirim' , timeout: 2000, onDismiss: () => {
      window.location.reload()
    }})
    await loadHistory()
    form.value = {
      account_name: '',
      bank_name: '',
      source_bank: '',
      amount: '',
      proof: null,
      is_verified : 0
    }


    if (formRef.value) formRef.value.resetValidation()

  } catch (err) {
    console.error(err)
    $q.notify({ type: 'negative', message: 'Gagal mengirim donasi' })
  } finally {
    loading.value = false
  }
}

const loadHistory = async () => {
  try {
    const res = await axios.get(`${API_BASE_URL}/donations`, {
      headers: authHeader(),
      params: { 
        user_id: userId,
        '$limit': 100
      }
    })
    history.value = res.data.data || res.data
  } catch (err) {
    console.error('Gagal ambil history donasi:', err)
  }
}

onMounted(() => {
  loadHistory()
})
</script>

<style scoped>
.donations-page {
  background: var(--serene-bg);
  min-height: 100vh;
}
.my-card {
  max-width: 700px;
  margin: auto;
}
.serene-input :deep(.q-field__control) {
  border-radius: 12px;
}
.serene-uploader {
  border-radius: 12px;
}
.serene-uploader .q-uploader__header {
  background-color: var(--serene-primary) !important;
}
.q-item-label {
  line-height: 1.2;
}
</style>
