<template>
  <div class="page-container">
    <!-- Welcome Section -->
    <div class="welcome-section">
      <div class="welcome-content">
        <h4 class="welcome-title">
          Welcome <span class="text-primary">{{ profile.display_name || 'Guest' }}</span>
        </h4>
        <p class="welcome-subtitle">Ngaji Bareng di Aplikasi ini Yuk!</p>
      </div>
      <q-avatar size="48px" class="profile-avatar" @click="$router.push('/profile')">
        <img :src="profile.avatar ? api.API_UPLOADS_URL + '/' + profile.avatar : 'https://placehold.co/100?text=👤'" alt="Avatar" />
      </q-avatar>
    </div>
    
    <!-- Search Bar -->
    <q-input
      v-model="searchText"
      rounded
      outlined
      dense
      placeholder="Cari Tajwid..."
      debounce="300"
      @keyup.enter="fetchSections"
      class="search-bar"
      bg-color="white"
    >
      <template v-slot:prepend>
        <q-icon name="search" color="primary" />
      </template>
      <template v-slot:append>
        <q-btn
          v-if="searchText"
          flat
          dense
          round
          icon="clear"
          color="grey"
          @click="() => { searchText = ''; fetchSections(); }"
        />
      </template>
    </q-input>

    <!-- Continue Watching -->
    <div v-if="continueWatching.length > 0" class="continue-section">
      <div class="section-header">
        <h5 class="section-title">Lanjutkan Pembelajaran</h5>
      </div>
      <q-scroll-area class="scroll-area">
        <div class="card-row">
          <q-card
            v-for="log in continueWatching.slice(0, 6)" 
            :key="log.id"
            class="lesson-card"
            :class="{ 'disabled-card': log.module_detail.is_deleted === 1 }"
            @click="log.module_detail.is_deleted !== 1 && $router.push(`/lesson/${log.parent_id}`)"
          >
            <q-img 
              :src="log.module_detail.thumbnail ? api.API_UPLOADS_URL + '/' + log.module_detail.thumbnail : 'https://placehold.co/300x150?text=Tajwid'"
              class="card-thumbnail"
              basic
            >
              <div class="progress-overlay">
                <q-linear-progress 
                  :value="log.last_position / log.duration" 
                  color="primary" 
                  class="progress-bar"
                />
              </div>
            </q-img>
            <q-card-section class="card-content">
              <div class="text-bold card-title">{{ log.module_detail.title || 'Untitled Module' }}</div>
              <div class="text-caption text-grey instructor">
                By {{ log.module_detail.module_detail.instructor_profile?.display_name || 'Unknown' }}
              </div>
              <div class="progress-text">
                {{ Math.floor((log.last_position / log.duration) * 100) || 0 }}% Completed
              </div>
              <div
                v-if="log.module_detail.is_deleted === 1"
                class="unavailable-badge"
              >
                Materi tidak tersedia
              </div>
            </q-card-section>
          </q-card>
        </div>
      </q-scroll-area>
    </div>

    <!-- Section List -->
    <div class="tajwid-section">
      <div class="section-header">
        <h5 class="section-title">List Hukum Tajwid</h5>
      </div>

      <q-list class="section-list">
        <q-expansion-item
          v-for="section in sections"
          :key="section.id"
          expand-separator
          dense
          class="section-item"
          header-class="section-header-item"
          @show="fetchModules(section.id)"
        >
          <template v-slot:header>
            <div class="section-header-content">
              <q-icon name="menu_book" color="primary" size="sm" class="q-mr-sm" />
              <div class="text-subtitle1 section-name">{{ section.section_name }}</div>
              <q-space />
              <q-icon name="expand_more" />
            </div>
          </template>

          <q-list class="module-list">
            <q-item v-if="!modulesMap[section.id]" class="loading-item">
              <q-item-section>
                <q-skeleton type="text" width="80%" />
                <q-skeleton type="text" width="60%" />
              </q-item-section>
            </q-item>

            <q-item
              v-for="module in modulesMap[section.id]"
              :key="module.id"
              clickable
              @click="$router.push(`/module/${module.id}`)"
              class="module-item"
            >
              <q-item-section avatar>
                <q-icon name="play_circle" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="module-title">{{ module.title }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-icon name="chevron_right" color="grey-6" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-expansion-item>
      </q-list>
    </div>
  </div>
</template>

<script setup>
import axios from "axios";
import { ref, onMounted } from "vue";
import api from "src/config/api"
import { authHeader } from "src/config/auth";

const profile = ref({});
const courses = ref([]);
const sections = ref([]);
const continueWatching = ref([]);
const modulesMap = ref({});
const searchText = ref('');
const accessToken = localStorage.getItem('token');
const userId = Number(localStorage.getItem('id'));

// Fetch filtered or all sections
const fetchSections = async () => {
  try {
    const params = {};
    if (searchText.value.trim()) {
      params['section_name[$like]'] = `%${String(searchText.value.trim())}%`;
    }

    const sectionsRes = await axios.get(`${api.API_BASE_URL}/sections`, {
      headers: authHeader(),
      params
    });

    sections.value = sectionsRes.data.data || [];
  } catch (e) {
    console.error('Failed to fetch sections:', e);
    sections.value = [];
  }
};

// Fetch modules for specific section
const fetchModules = async (sectionId) => {
  if (modulesMap.value[sectionId]) return;

  try {
    const res = await axios.get(`${api.API_BASE_URL}/modules`, {
      headers: authHeader(),
      params: { section_id: sectionId, is_deleted: 0 }
    });
    modulesMap.value[sectionId] = res.data.data || [];
  } catch (err) {
    console.error(`Failed to fetch modules for section ${sectionId}:`, err);
    modulesMap.value[sectionId] = [];
  }
};

onMounted(async () => {
  const profileData = localStorage.getItem('profile');
  if (profileData) {
    try {
      profile.value = JSON.parse(profileData);
    } catch (e) {
      console.error('Error parsing profile from localStorage', e);
    }
  }

  await fetchSections();

  const [modulesResult, logsResult] = await Promise.allSettled([
    axios.get(`${api.API_BASE_URL}/modules`, {
      headers: authHeader(),
    }),
    axios.get(`${api.API_BASE_URL}/videologs`, {
      headers: authHeader(),
      params: { user_id: userId }
    })
  ]);

  if (modulesResult.status === 'fulfilled') {
    const { data: modulesData } = modulesResult.value.data;
    courses.value = modulesData;
  }

  if (logsResult.status === 'fulfilled') {
    const videoLogs = logsResult.value.data.data || [];
    continueWatching.value = videoLogs
      .filter(v => v.is_complete === 0)
      .sort((a, b) => new Date(b.updated_date) - new Date(a.updated_date));
  }
});
</script>

<style scoped>
.page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.welcome-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.welcome-content {
  flex: 1;
}

.welcome-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 4px;
}

.welcome-subtitle {
  font-size: 1rem;
  color: #666;
}

.profile-avatar {
  cursor: pointer;
  border: 2px solid #eee;
  transition: transform 0.2s;
}

.profile-avatar:hover {
  transform: scale(1.05);
}

.search-bar {
  margin: 16px 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.continue-section {
 margin: 16px 0 8px 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
}

.scroll-area {
  height: 280px;
}

.card-row {
  display: flex;
  gap: 16px;
  padding: 8px 4px;
}

.lesson-card {
  width: 220px;
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
}

.lesson-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 16px rgba(0,0,0,0.1);
}

.disabled-card {
  opacity: 0.7;
  filter: grayscale(70%);
  cursor: not-allowed;
}

.card-thumbnail {
  height: 140px;
}

.progress-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 0 8px;
}

.progress-bar {
  height: 4px;
  border-radius: 2px;
}

.card-content {
  padding: 12px;
}

.card-title {
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.instructor {
  margin: 4px 0;
}

.progress-text {
  font-size: 0.75rem;
  color: #666;
  margin-top: 4px;
}

.unavailable-badge {
  background-color: #ff4444;
  color: white;
  font-size: 0.7rem;
  padding: 4px;
  border-radius: 4px;
  text-align: center;
  margin-top: 8px;
}

.tajwid-section {
  margin: 8px 0 24px 0; /* Reduced from original 40px 0 */
  padding-top: 0; /* Added to remove any additional padding */
}

.section-list {
  border-radius: 12px;
  overflow: hidden;
}

.section-item {
  margin-bottom: 8px;
}

.section-header-item {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 12px 16px;
  transition: background-color 0.2s;
}

.section-header-item:hover {
  background-color: #f1f3f5;
}

.section-header-content {
  display: flex;
  align-items: center;
  width: 100%;
}

.section-name {
  font-weight: 500;
}

.module-list {
  padding: 8px;
}

.module-item {
  border-radius: 8px;
  margin-bottom: 4px;
  transition: background-color 0.2s;
}

.module-item:hover {
  background-color: #f8f9fa;
}

.module-title {
  font-weight: 500;
  font-size: 0.9rem;
}

.loading-item {
  padding: 16px;
}

@media (max-width: 768px) {
  .card-row {
    padding: 8px 0;
  }
  
  .lesson-card {
    width: 180px;
  }
  
  .card-thumbnail {
    height: 120px;
  }
}
</style>
