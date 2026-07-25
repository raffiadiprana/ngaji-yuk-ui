<template>
  <q-page padding>
    <!-- Form Donasi -->
    <q-card class="my-card">
      <q-card-section>
        <q-form @submit.prevent="submitForm" ref="formRef" class="q-gutter-md">
          <q-input v-model="form.account_name" label="Nama Pemilik Rekening" filled />
          <q-input v-model="form.bank_name" label="Nama Bank Asal" filled />
          <q-input v-model="form.source_bank" label="Nomor Rekening Bank Asal" filled />
          <q-input
            v-model="form.amount"
            label="Nominal Transfer"
            type="number"
            filled
            prefix="Rp"
          />

          <q-uploader
            label="Upload Bukti Transfer"
            v-model="form.proof"
            accept="image/*"
            @added="onFileChange"
            :auto-upload="false"
            class="q-mt-md"
          />

          <div class="row justify-end q-gutter-sm">
            <q-btn label="Kirim Donasi" color="primary" type="submit" :loading="loading" />
          </div>
        </q-form>
      </q-card-section>
    </q-card>

    <q-separator spaced />

    <!-- History -->
    <q-card class="my-card q-mt-md">
      <q-card-section>
        <div class="text-h6 q-mb-md">Riwayat Donasi Anda</div>
        <q-list bordered separator>
          <q-item v-for="item in history" :key="item.id" class="q-mb-sm">
            <q-item-section avatar>
              <q-avatar rounded size="56px">
                <q-img :src="`${API_UPLOADS_URL}/${item.proof_image}`" />
              </q-avatar>
            </q-item-section>

            <q-item-section>
              <q-item-label class="text-bold">{{ item.account_name }}</q-item-label>
              <q-item-label caption class="text-grey">
                {{ item.bank_name }} - {{ item.source_bank }}
              </q-item-label>
              <q-item-label caption class="text-primary">
                Rp {{ Number(item.amount).toLocaleString('id-ID') }}
              </q-item-label>
              <q-item-label caption>
                {{ formatDate(item.created_at) }}
              </q-item-label>
            
              <q-badge
                outline
                :color="item.is_verified == 1 ? 'green' : 
                        item.is_verified == 2 ? 'red' : 'orange'"
                class="q-mt-sm"
                align="left"
              >
                {{ item.is_verified == 1? 'Terverifikasi' : 
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
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import api from 'src/config/api'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const formRef = ref(null)
const loading = ref(false)

const API_BASE_URL = api.API_BASE_URL
const API_UPLOADS_URL = api.API_UPLOADS_URL
const userId = localStorage.getItem('id')
const accessToken = localStorage.getItem('token')

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
          Authorization: ` ${accessToken}`
        }
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
        Authorization: ` ${accessToken}`
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
      headers: { Authorization: ` ${accessToken}` },
      params: { 
        user_id: userId,
        $sort: {
          created_at: -1 // urutkan dari terbaru ke terlama
        } 
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
.my-card {
  max-width: 700px;
  margin: auto;
}
.q-item-label {
  line-height: 1.2;
}
</style>
