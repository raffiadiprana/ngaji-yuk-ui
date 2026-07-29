<template>
  <div class="users-page q-pa-md">
    <!-- Welcome -->
    <div class="row items-center hp-profil-header q-mb-md serene-card q-pa-md">
      <div class="col">
        <h5 class="text-bold text-serene-on-surface">
          Assalamu'alaikum, {{ profile.display_name || 'Admin' }}
        </h5>
        <p class="text-serene-variant" style="margin-top:4px;">Kelola data santri dan akun pengguna aplikasi.</p>
      </div>
    </div>

    <!-- Filters / Actions -->
    <div class="row items-center justify-between q-mb-md">
      <h6 class="text-bold text-serene-on-surface">Daftar Santri</h6>
      <q-btn label="Tambah Santri" color="serene-primary" flat rounded dense @click="onAddSantri" />
    </div>

    <!-- Loading -->
    <div v-if="loadingUsers" class="text-center q-py-md text-serene-variant">
      Memuat data pengguna...
    </div>

    <!-- Empty -->
    <div v-else-if="users.length === 0" class="empty-state text-serene-variant q-py-lg text-center">
      Belum ada data santri.
    </div>

    <!-- Users List -->
    <div v-else class="q-gutter-md">
      <q-item
        v-for="user in users"
        :key="user.id"
        class="q-mb-md serene-card hover-lift"
        clickable
        @click="editSantri(user)"
        bordered
      >
        <q-item-section avatar>
          <q-avatar size="48px">
            <img :src="user.avatar ? `${API_UPLOADS_URL}/${user.avatar}` : 'https://placehold.co/100?text=👤'" />
          </q-avatar>
        </q-item-section>

        <q-item-section>
          <q-item-label class="text-h6 text-weight-medium text-serene-on-surface">{{ user.display_name || 'Santri' }}</q-item-label>
          <q-item-label caption class="text-serene-variant">{{ user.email }}</q-item-label>
          <div class="q-mt-xs">
            <q-badge :color="user.role === 'guru' ? 'primary' : 'secondary'" :label="user.role" />
            <q-badge v-if="user.is_verified" color="positive" label="Terverifikasi" class="q-ml-xs" />
          </div>
        </q-item-section>

        <q-item-section side>
          <q-btn flat dense round size="xs" icon="more_vert" @click.stop>
            <q-menu auto-close>
              <q-list style="min-width: 100px;">
                <q-item clickable @click="editSantri(user)">
                  <q-item-section>Edit</q-item-section>
                </q-item>
                <q-item clickable @click="deleteSantri(user)">
                  <q-item-section>Hapus</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </q-item-section>
      </q-item>
    </div>

    <q-btn
      v-if="hasMore && !loadingUsers"
      label="Tampilkan lebih banyak"
      outline
      class="full-width q-mt-md serene-btn-outline"
      @click="loadMore"
      :loading="loadingMore"
    />
  </div>
</template>
  
<script setup>
  import { useQuasar } from 'quasar'
  const $q = useQuasar()
  import { ref, onMounted, onBeforeUnmount } from 'vue'
  import { useRouter } from 'vue-router'
  import axios from 'axios'
  import api from 'src/config/api'
  import { authHeader } from 'src/config/auth'

  const router = useRouter()

  const profile = ref({})
  const users = ref([])

  const loadingUsers = ref(false)
  const loadingMore = ref(false)
  const hasMore = ref(true)
  const skipUsers = ref(0)
  const limitUsers = 20

  let abortController = null

  const cancelPending = () => {
    if (abortController) {
      try { abortController.abort() } catch {}
      abortController = null
    }
  }

  onMounted(async () => {
    const profileData = localStorage.getItem('profile')
    if (profileData) {
      try {
        profile.value = JSON.parse(profileData)
      } catch (e) {
        console.error('Error parsing profile from localStorage', e)
      }
    }
    await loadUsers()
  })

  const loadUsers = async () => {
    cancelPending()
    abortController = new AbortController()
    loadingUsers.value = true

    try {
      const res = await axios.get(`${api.API_BASE_URL}/users`, {
        headers: authHeader(),
        params: {
          role: 'santri',
          '$limit': limitUsers,
          '$skip': skipUsers.value
        },
        signal: abortController.signal
      })

      const data = res.data.data || []
      const filtered = data.filter((u) => !u.is_deleted)

      if (skipUsers.value === 0) {
        users.value = filtered
      } else {
        users.value.push(...filtered)
      }

      hasMore.value = filtered.length === limitUsers
    } catch (e) {
      if (!axios.isCancel(e)) {
        console.error('Gagal memuat pengguna:', e)
      }
    } finally {
      loadingUsers.value = false
      loadingMore.value = false
    }
  }

  const loadMore = async () => {
    if (loadingMore.value || !hasMore.value) return
    loadingMore.value = true
    skipUsers.value += limitUsers
    await loadUsers()
  }

  const onAddSantri = () => router.push('/user-form')
  const editSantri = (user) => router.push(`/user-form/${user.id}`)

  const deleteSantri = async (user) => {
    $q.dialog({
      title: 'Konfirmasi Hapus',
      message: `Apakah Anda yakin ingin menghapus <strong>${user.display_name || user.email}</strong>?`,
      html: true,
      cancel: { label: 'Batal', color: 'grey' },
      ok: { label: 'Hapus', color: 'red' },
      persistent: true
    }).onOk(async () => {
      try {
        const profileRes = await axios.get(`${api.API_BASE_URL}/profiles`, {
          headers: authHeader(),
          params: { user_id: user.id }
        })
        const profileId = profileRes.data.data?.[0]?.id
        if (profileId) {
          await axios.delete(`${api.API_BASE_URL}/profiles/${profileId}`, {
            headers: authHeader()
          })
        }

        await axios.delete(`${api.API_BASE_URL}/users/${user.id}`, {
          headers: authHeader()
        })

        users.value = users.value.filter((u) => u.id !== user.id)
        $q.notify({ type: 'positive', message: 'Pengguna berhasil dihapus' })
      } catch (err) {
        console.error('Gagal menghapus pengguna:', err)
        $q.notify({ type: 'negative', message: 'Gagal menghapus pengguna' })
      }
    })
  }

  onBeforeUnmount(() => {
    cancelPending()
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
  