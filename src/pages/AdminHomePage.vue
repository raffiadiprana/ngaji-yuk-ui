<template>
  <div class="container q-pa-md">
    <!-- Welcome Section -->
    <div class="welcome-section">
      <div class="row items-center justify-between q-mb-lg">
        <div class="col">
          <h4 class="text-bold welcome-title">
            Welcome <span class="text-primary">{{ profile.display_name || 'Guest' }}</span>
          </h4>
          <p class="text-grey-7 welcome-subtitle">Manage your students and teachers</p>
        </div>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="main-grid">
      <!-- Students Section -->
      <div class="section-card">
        <div class="section-header">
          <h5 class="text-bold section-title">Daftar Santri</h5>
          
        </div>

        <q-list bordered separator class="rounded-borders">
          <q-item
            v-for="santri in santris"
            :key="santri.id"
            class="list-item"
            clickable
            v-ripple
          >
            <q-item-section avatar>
              <q-avatar color="teal" text-color="white">
                {{ santri.email.charAt(0).toUpperCase() }}
              </q-avatar>
            </q-item-section>

            <q-item-section>
              <q-item-label class="text-weight-bold">{{ santri.email }}</q-item-label>
              <q-item-label caption>Santri</q-item-label>
            </q-item-section>

            <q-item-section side>
              <q-btn flat round dense icon="more_vert" @click.stop>
                <q-menu auto-close>
                  <q-list style="min-width: 120px;">
                    <q-item clickable @click="editGuru(santri)" class="text-primary">
                      <q-item-section avatar>
                        <q-icon name="edit" />
                      </q-item-section>
                      <q-item-section>Edit</q-item-section>
                    </q-item>
                    <q-item clickable @click="deleteGuru(santri)" class="text-negative">
                      <q-item-section avatar>
                        <q-icon name="delete" />
                      </q-item-section>
                      <q-item-section>Delete</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </q-item-section>
          </q-item>
        </q-list>
      </div>

      <!-- Teachers Section -->
      <div class="section-card">
        <div class="section-header">
          <h5 class="text-bold section-title">Daftar Guru</h5>
          <q-btn 
            label="Tambah Guru" 
            color="primary" 
            rounded 
            dense
            icon="add"
            @click="onAddGuru"
          />
        </div>

        <q-list bordered separator class="rounded-borders">
          <q-item
            v-for="guru in gurus"
            :key="guru.id"
            class="list-item"
            clickable
            v-ripple
            @click="editGuru(guru)"
          >
            <q-item-section avatar>
              <q-avatar color="indigo" text-color="white">
                {{ guru.email.charAt(0).toUpperCase() }}
              </q-avatar>
            </q-item-section>

            <q-item-section>
              <q-item-label class="text-weight-bold">{{ guru.email }}</q-item-label>
              <q-item-label caption>Guru</q-item-label>
            </q-item-section>

            <q-item-section side>
              <q-btn flat round dense icon="more_vert" @click.stop>
                <q-menu auto-close>
                  <q-list style="min-width: 120px;">
                    <q-item clickable @click="editGuru(guru)" class="text-primary">
                      <q-item-section avatar>
                        <q-icon name="edit" />
                      </q-item-section>
                      <q-item-section>Edit</q-item-section>
                    </q-item>
                    <q-item clickable @click="deleteGuru(guru)" class="text-negative">
                      <q-item-section avatar>
                        <q-icon name="delete" />
                      </q-item-section>
                      <q-item-section>Delete</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </q-item-section>
          </q-item>
        </q-list>

        <q-btn
          v-if="hasMoreSantri"
          label="Tampilkan lebih banyak"
          outline
          color="primary"
          class="full-width q-mt-md"
          @click="loadMoreSantris"
          :loading="loadingSantri"
        />
      </div>

      <!-- Donations Section -->
      <div class="section-card">
        <div class="section-header">
          <h5 class="text-bold section-title">Riwayat Donasi</h5>
        </div>

        <q-list bordered separator class="rounded-borders">
          <q-item 
            v-for="donation in donations" 
            :key="donation.id" 
            class="donation-item"
          >
            <q-item-section avatar>
              <q-avatar rounded size="56px" class="donation-avatar">
                <q-img :src="`${API_UPLOADS_URL}/${donation.proof_image}`" />
                <q-badge 
                  :color="donation.is_verified == 1 ? 'positive' : 
                           donation.is_verified == 2 ? 'negative' : 'warning'" 
                  floating
                  :label="donation.is_verified == 1 ? 'Verified' : 
                           donation.is_verified == 2 ? 'Rejected' : 'Pending'"
                />
              </q-avatar>
            </q-item-section>

            <q-item-section>
              <q-item-label class="text-weight-bold">{{ donation.account_name }}</q-item-label>
              <q-item-label caption class="text-grey">
                {{ donation.bank_name }} • {{ donation.source_bank }}
              </q-item-label>
              <q-item-label class="text-primary text-weight-bold">
                Rp {{ Number(donation.amount).toLocaleString('id-ID') }}
              </q-item-label>
              <q-item-label caption>
                {{ formatDate(donation.created_at) }}
              </q-item-label>
            </q-item-section>

            <q-item-section side>
              <q-btn 
                flat 
                round 
                icon="visibility" 
                color="grey-7"
                @click="openDialog(donation)" 
              />
            </q-item-section>
          </q-item>
        </q-list>
      </div>
    </div>
  </div>

  <DialogDonasi
    v-model="dialogVisible"
    :donation="selectedDonation"
    :API_UPLOADS_URL="API_UPLOADS_URL"
    :accessToken="accessToken"
    :apiUrl="api.API_BASE_URL"
    @donationUpdated="fetchDonations"
  />
</template>

<script setup>
import { useQuasar } from 'quasar'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import api from 'src/config/api'
import { authHeader } from 'src/config/auth'
import DialogDonasi from 'src/components/DialogDonasi.vue'

const $q = useQuasar()
const router = useRouter()

const profile = ref({})
const gurus = ref([])
const santris = ref([])
const donations = ref([])
const unreadNotifications = ref(3) // Example value

const accessToken = localStorage.getItem('token')
const API_UPLOADS_URL = api.API_UPLOADS_URL

const skipGurus = ref(0)
const limitGurus = 10
const loadingGuru = ref(false)
const hasMoreGuru = ref(true)

const skipSantris = ref(0)
const limitSantris = 10
const loadingSantri = ref(false)
const hasMoreSantri = ref(true)

const dialogVisible = ref(false)
const selectedDonation = ref(null)

// Fetch profile + guru + donasi
onMounted(async () => {
  const profileData = localStorage.getItem('profile')
  if (profileData) {
    try {
      profile.value = JSON.parse(profileData)
    } catch (e) {
      console.error('Error parsing profile from localStorage', e)
    }
  }

  await fetchGuru()
  await fetchSantris()
  await fetchDonations()
})

// Fetch Guru
const fetchGuru = async () => {
  if (loadingGuru.value) return
  loadingGuru.value = true

  try {
    const res = await axios.get(`${api.API_BASE_URL}/users`, {
      headers: authHeader(),
      params: {
        role: 'guru',
        $skip: skipGurus.value,
        $limit: limitGurus
      }
    })

    const fetchedGuru = res.data.data || []
    if (fetchedGuru.length > 0) {
      gurus.value.push(...fetchedGuru)
    }

    hasMoreGuru.value = fetchedGuru.length === limitGurus
  } catch (err) {
    console.error('Failed to fetch gurus:', err)
  } finally {
    loadingGuru.value = false
  }
}

const fetchSantris = async () => {
  if (loadingSantri.value) return
  loadingSantri.value = true

  try {
    const res = await axios.get(`${api.API_BASE_URL}/users`, {
      headers: authHeader(),
      params: {
        role: 'santri',
        $skip: skipSantris.value,
        $limit: limitSantris
      }
    })

    const fetchedSantris = res.data.data || []
    if (fetchedSantris.length > 0) {
      santris.value.push(...fetchedSantris)
    }

    hasMoreSantri.value = fetchedSantris.length === limitSantris
  } catch (err) {
    console.error('Failed to fetch santris:', err)
  } finally {
    loadingSantri.value = false
  }
}

const loadMoreSantris = () => {
  if (!loadingSantri.value && hasMoreSantri.value) {
    skipSantris.value += limitSantris
    fetchSantris()
  }
}

const openDialog = (donation) => {
  console.log('donation', donation);
  
  selectedDonation.value = donation
  dialogVisible.value = true
}

// Fetch Donasi
const fetchDonations = async () => {
  try {
    const res = await axios.get(`${api.API_BASE_URL}/donations?`, {
      headers: authHeader(),
      params: {
        $sort: {
          created_at: -1 // urutkan dari terbaru ke terlama
        }
      }
    })
    donations.value = res.data.data || res.data
    dialogVisible.value = false
  } catch (err) {
    console.error('Gagal mengambil donasi:', err)
  }
}

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// const viewDonation = (donation) => {
//   $q.dialog({
//     title: 'Detail Donasi',
//     message: `
//       <div class="donation-dialog">
//         <div class="donation-info">
//           <div><strong>Nama:</strong> ${donation.account_name}</div>
//           <div><strong>Bank:</strong> ${donation.bank_name}</div>
//           <div><strong>Rekening:</strong> ${donation.source_bank}</div>
//           <div><strong>Nominal:</strong> Rp ${Number(donation.amount).toLocaleString('id-ID')}</div>
//           <div><strong>Status:</strong> ${donation.is_verified ? '<span style="color:green">Terverifikasi</span>' : '<span style="color:orange">Belum diverifikasi</span>'}</div>
//         </div>
//         <div class="donation-image">
//           <img
//             src="${API_UPLOADS_URL}/${donation.proof_image}"
//             alt="Bukti Transfer"
//           />
//         </div>
//       </div>
//     `,
//     html: true,
//     ok: {
//       label: 'Verifikasi Donasi',
//       color: 'green'
//     }, 
//     cancel: !donation.is_verified
//       ? {
//           label: 'Tutup',
//           color: 'green'
//         }
//       : undefined,
//   }).onOk(async () => {
//     try {
//       await axios.patch(`${api.API_BASE_URL}/donations/${donation.id}`, {
//         is_verified: 1
//       }, {
//         headers: {
//           Authorization: ` ${accessToken}`
//         }
//       })

//       $q.notify({ 
//         type: 'positive', 
//         message: 'Donasi berhasil diverifikasi',
//         position: 'top'
//       })
//       fetchDonations()
//     } catch (err) {
//       console.error('Gagal verifikasi donasi:', err)
//       $q.notify({ 
//         type: 'negative', 
//         message: 'Gagal memverifikasi donasi',
//         position: 'top'
//       })
//     }
//   })
// }

// Actions
const onAddGuru = () => router.push('/user-form')
const editGuru = (guru) => router.push(`/user-form/${guru.id}`)
const deleteGuru = async (guru) => {
  $q.dialog({
    title: 'Konfirmasi Hapus',
    message: `Apakah Anda yakin ingin menghapus ${guru.role === 'guru' ? 'guru' : 'santri'} <strong>${guru.email}</strong>?`,
    html: true,
    cancel: {
      label: 'Batal',
      color: 'grey'
    },
    ok: {
      label: 'Hapus',
      color: 'red'
    },
    persistent: true
  }).onOk(async () => {
    try {
      // 1. Ambil profile guru berdasarkan user_id
      const profileRes = await axios.get(`${api.API_BASE_URL}/profiles`, {
        headers: authHeader(),
        params: { user_id: guru.id }
      })

      const profileId = profileRes.data.data?.[0]?.id
      if (profileId) {
        // 2. Hapus profile berdasarkan ID
        await axios.delete(`${api.API_BASE_URL}/profiles/${profileId}`, {
          headers: authHeader(),
        })
      }

      // 3. Hapus akun user guru
      await axios.delete(`${api.API_BASE_URL}/users/${guru.id}`, {
        headers: authHeader(),
      })

      // 4. Update tampilan lokal
      if (guru.role === 'guru') {
        gurus.value = gurus.value.filter(g => g.id !== guru.id)
      } else {
        santris.value = santris.value.filter(s => s.id !== guru.id)
      }

      $q.notify({ 
        type: 'positive', 
        message: `${guru.role === 'guru' ? 'Guru' : 'Santri'} berhasil dihapus`,
        position: 'top'
      })
    } catch (err) {
      console.error('Gagal menghapus:', err)
      $q.notify({ 
        type: 'negative', 
        message: `Gagal menghapus ${guru.role === 'guru' ? 'guru' : 'santri'}`,
        position: 'top'
      })
    }
  })
}
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.welcome-section {
  margin-bottom: 32px;
}

.welcome-title {
  font-size: 1.75rem;
  margin-bottom: 4px;
}

.welcome-subtitle {
  font-size: 1rem;
}

.notification-btn {
  font-size: 1.25rem;
}

.main-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}

@media (min-width: 992px) {
  .main-grid {
    grid-template-columns: 1fr 1fr;
  }
  
  .section-card:last-child {
    grid-column: span 2;
  }
}

.section-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.05);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-title {
  font-size: 1.25rem;
  margin: 0;
}

.list-item {
  border-radius: 8px;
  margin-bottom: 8px;
  transition: all 0.3s ease;
}

.list-item:hover {
  background-color: #f5f5f5;
  transform: translateY(-2px);
}

.donation-item {
  border-radius: 8px;
  margin-bottom: 8px;
  transition: all 0.3s ease;
}

.donation-item:hover {
  background-color: #f5f5f5;
}

.donation-avatar {
  border: 1px solid #eee;
}

.q-badge {
  font-size: 0.65rem;
  padding: 2px 4px;
}

/* Dialog styles */
.donation-dialog {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.donation-info {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
}

.donation-info div {
  padding: 4px 0;
}

.donation-image img {
  max-width: 100%;
  border-radius: 8px;
  border: 1px solid #eee;
  margin-top: 10px;
}

@media (min-width: 600px) {
  .donation-dialog {
    flex-direction: row;
  }
  
  .donation-info {
    min-width: 200px;
  }
  
  .donation-image {
    min-width: 300px;
  }
}
</style>