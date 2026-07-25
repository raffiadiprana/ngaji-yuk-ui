<template>
  <q-dialog v-model="dialogVisible" persistent>
    <q-card style="min-width: 500px">
      <!-- Header -->
      <q-card-section class="row items-center">
        <div class="text-h6">Detail Donasi</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <!-- Konten -->
      <q-card-section class="q-pt-none">
        <div class="row q-col-gutter-md">
          <!-- Info Donasi -->
          <div class="col-md-6">
            <div><strong>Nama:</strong> {{ donation.account_name }}</div>
            <div><strong>Bank:</strong> {{ donation.bank_name }}</div>
            <div><strong>Rekening:</strong> {{ donation.source_bank }}</div>
            <div><strong>Nominal:</strong> Rp {{ formatAmount(donation.amount) }}</div>
            <div><strong>Status:</strong> 
              <span :style="{ color: donation.is_verified ? 'green' : 'orange' }">
                {{ donation.is_verified ? 'Terverifikasi' : 'Belum diverifikasi' }}
              </span>
            </div>
          </div>

          <!-- Gambar Bukti -->
          <div class="col-md-6">
            <q-img
              :src="`${API_UPLOADS_URL}/${donation.proof_image}`"
              alt="Bukti Transfer"
              style="max-height: 200px"
            />
          </div>
        </div>

        <!-- Input Alasan (Muncul saat Tolak diklik) -->
        <q-input
          v-if="showRejectReason"
          v-model="rejectReason"
          label="Alasan Penolakan"
          type="textarea"
          class="q-mt-md"
          :rules="[val => !!val || 'Harap isi alasan penolakan']"
          required
        />
      </q-card-section>

      <!-- Tombol Aksi -->
      <q-card-actions align="right">
        <q-btn 
          flat 
          label="Tutup" 
          color="primary" 
          v-close-popup 
        />
        <q-btn 
          v-if="!donation.is_verified"
          label="Verifikasi" 
          color="positive" 
          @click="verifyDonation" 
        />
        <q-btn 
          v-if="!donation.is_verified"
          label="Tolak" 
          color="negative" 
          @click="toggleRejectReason"
        />
        <q-btn 
          v-if="showRejectReason"
          label="Kirim Penolakan" 
          color="negative" 
          @click="rejectDonation"
          :disable="!rejectReason"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import axios from 'axios'

const props = defineProps({
  donation: Object,
  API_UPLOADS_URL: String,
  accessToken: String,
  apiUrl: String
})

const emit = defineEmits(['donationUpdated'])

const $q = useQuasar()
const dialogVisible = ref(true)
const showRejectReason = ref(false)
const rejectReason = ref('')

const formatAmount = (amount) => {
  return Number(amount).toLocaleString('id-ID')
}

const verifyDonation = async () => {
  try {
    await axios.patch(`${props.apiUrl}/donations/${props.donation.id}`, {
      is_verified: 1
    }, {
      headers: {
        Authorization: ` ${props.accessToken}`
      }
    })

    $q.notify({
      type: 'positive',
      message: 'Donasi berhasil diverifikasi!',
      position: 'top'
    })
    emit('donationUpdated')
    dialogVisible.value = false
  } catch (error) {
    console.error('Gagal verifikasi:', error)
    $q.notify({
      type: 'negative',
      message: 'Gagal memverifikasi donasi',
      position: 'top'
    })
  }
}

const toggleRejectReason = () => {
  showRejectReason.value = !showRejectReason.value
}

const rejectDonation = async () => {
  if (!rejectReason.value) return

  try {
    await axios.patch(`${props.apiUrl}/donations/${props.donation.id}`, {
      is_verified: 2,
      reject_reason: rejectReason.value
    }, {
      headers: {
        Authorization: ` ${props.accessToken}`
      }
    })

    $q.notify({
      type: 'positive',
      message: 'Donasi berhasil ditolak!',
      position: 'top'
    })
    emit('donationUpdated')
    dialogVisible.value = false
  } catch (error) {
    console.error('Gagal menolak donasi:', error)
    $q.notify({
      type: 'negative',
      message: 'Gagal menolak donasi',
      position: 'top'
    })
  }
}
</script>