<template>
  <div class="container q-pa-md">
    <!-- Welcome Section -->
    <div class="welcome-section">
      <div class="row items-center justify-between q-mb-lg">
        <div class="col">
          <h4 class="text-bold welcome-title">
            Welcome <span class="text-primary">{{ profile.display_name || 'Guest' }}</span>
          </h4>
          <p class="text-grey-7 welcome-subtitle">Manage your Tajwid learning materials</p>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="section-card">
      <div class="section-header">
        <h5 class="text-bold section-title">Daftar Hukum Tajwid</h5>
        <q-btn 
          label="Tambah Hukum Tajwid" 
          color="primary" 
          rounded 
          dense
          icon="add"
          @click="onAddTajwid"
        />
      </div>

      <!-- Tajwid List -->
      <q-list bordered separator class="rounded-borders">
        <q-item
          v-for="tajwid in sections"
          :key="tajwid.id"
          class="list-item"
          clickable
          v-ripple
          @click="editTajwid(tajwid)"
        >
          <q-item-section avatar>
            <q-avatar color="teal" text-color="white">
              {{ tajwid.section_name.charAt(0).toUpperCase() }}
            </q-avatar>
          </q-item-section>

          <q-item-section>
            <q-item-label class="text-weight-bold">{{ tajwid.section_name }}</q-item-label>
            <q-item-label caption>Hukum Tajwid</q-item-label>
          </q-item-section>

          <q-item-section side>
            <q-btn flat round dense icon="more_vert" @click.stop>
              <q-menu auto-close>
                <q-list style="min-width: 120px;">
                  <q-item clickable @click="editTajwid(tajwid)" class="text-primary">
                    <q-item-section avatar>
                      <q-icon name="edit" />
                    </q-item-section>
                    <q-item-section>Edit</q-item-section>
                  </q-item>
                  <q-item clickable @click="deleteTajwid(tajwid)" class="text-negative">
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

      <!-- Load More Button -->
      <q-btn
        v-if="hasMoreGuru"
        label="Tampilkan lebih banyak"
        outline
        color="primary"
        class="full-width q-mt-md"
        @click="loadMoreCourses"
        :loading="loadingGuru"
      />
      <p v-else class="text-grey-6 text-center q-mt-md">Tidak ada data lagi</p>
    </div>
  </div>
</template>

<script setup>
import { useQuasar } from 'quasar'
const $q = useQuasar()
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import api from "src/config/api"
import { authHeader } from "src/config/auth";
    
const router = useRouter();
    
const profile = ref({});
const sections = ref([]);
const quizzes = ref([]);
const lessons = ref([]);
const accessToken = localStorage.getItem('token');
const instructorId = localStorage.getItem('id');
    
// Paging for Courses
const skipGurus = ref(0);
const limitGurus = 10;
const loadingGuru = ref(false);
const hasMoreGuru = ref(true);

// Paging for Quizzes
const skipQuizzes = ref(0);
const limitQuizzes = 10;
const loadingQuizzes = ref(false);
const hasMoreQuizzes = ref(true);

// Paging for Lessons
const skipLessons = ref(0);
const limitLessons = 10;
const loadingLessons = ref(false);
const hasMoreLessons = ref(true);
    
// Ambil profile dari localStorage
onMounted(async () => {
  const profileData = localStorage.getItem('profile');
  if (profileData) {
    try {
      profile.value = JSON.parse(profileData);
    } catch (e) {
      console.error('Error parsing profile from localStorage', e);
    }
  }
    
  // Load pertama kali untuk kursus, quiz, dan lessons
  await fetchSection();
});
    
// Fungsi untuk mengambil data kursus berdasarkan skip dan limit
const fetchSection = async () => {
  if (loadingGuru.value) return;
  loadingGuru.value = true;
    
  try {
    const res = await axios.get(`${api.API_BASE_URL}/sections`, {
      headers: authHeader(),
    });
        
    const fetchedGuru = res.data.data || [];
        
    if (fetchedGuru.length > 0) {
      sections.value.push(...fetchedGuru);
    }
    
    hasMoreGuru.value = fetchedGuru.length === limitGurus;
    
  } catch (err) {
    console.error('Failed to fetch sections:', err);
  } finally {
    loadingGuru.value = false;
  }
};

// Fungsi untuk mengambil data quiz berdasarkan skip dan limit
const fetchQuizzes = async () => {
  if (loadingQuizzes.value) return;
  loadingQuizzes.value = true;

  try {
    const res = await axios.get(`${api.API_BASE_URL}/quiz`, {
      headers: authHeader(),
      params: { 
        created_by: instructorId,  // Filter berdasarkan instructor_id pada module
        is_deleted: 0,
        $skip: skipQuizzes.value, 
        $limit: limitQuizzes,
      }
    });

    const fetchedQuizzes = res.data.data || [];

    if (fetchedQuizzes.length > 0) {
      quizzes.value.push(...fetchedQuizzes);
    }

    hasMoreQuizzes.value = fetchedQuizzes.length === limitQuizzes;

  } catch (err) {
    console.error('Failed to fetch quizzes:', err);
  } finally {
    loadingQuizzes.value = false;
  }
};

// Fungsi untuk mengambil data lessons berdasarkan skip dan limit
const fetchLessons = async () => {
  if (loadingLessons.value) return;
  loadingLessons.value = true;

  try {
    const res = await axios.get(`${api.API_BASE_URL}/lessons`, {
      headers: authHeader(),
      params: { 
        created_by: instructorId, // Filter berdasarkan instructor_id
        is_deleted: 0,
        $skip: skipLessons.value, 
        $limit: limitLessons
      }
    });

    const fetchedLessons = res.data.data || [];

    if (fetchedLessons.length > 0) {
      lessons.value.push(...fetchedLessons);
    }

    hasMoreLessons.value = fetchedLessons.length === limitLessons;

  } catch (err) {
    console.error('Failed to fetch lessons:', err);
  } finally {
    loadingLessons.value = false;
  }
};

// Fungsi untuk menangani tombol "Load More" untuk kursus
const loadMoreCourses = () => {
  if (!loadingGuru.value && hasMoreGuru.value) {
    skipGurus.value += limitGurus;
    fetchSection();
  }
};

// Fungsi untuk menangani tombol "Load More" untuk quiz
const loadMoreQuizzes = () => {
  if (!loadingQuizzes.value && hasMoreQuizzes.value) {
    skipQuizzes.value += limitQuizzes;
    fetchQuizzes();
  }
};

// Fungsi untuk menangani tombol "Load More" untuk lessons
const loadMoreLessons = () => {
  if (!loadingLessons.value && hasMoreLessons.value) {
    skipLessons.value += limitLessons;
    fetchLessons();
  }
};
    
const onAddTajwid = () => {
  router.push('/tajwid-form');
};

const onAddQuiz = () => {
  router.push('/quiz-form');
};

const onAddLesson = () => {
  router.push('/lesson-form');
};
    
const editTajwid = (tajwid) => {
  router.push(`/tajwid-form/${tajwid.id}`);
};

const editQuiz = (quiz) => {
  router.push(`/quiz-form/${quiz.id}`);
};
    
const deleteQuiz = (quiz) => {
  console.log('Delete quiz:', quiz);
};

const editLesson = (lesson) => {
  router.push(`/lesson-form/${lesson.id}`);
};

const deleteTajwid = (section) => {
  $q.dialog({
    title: 'Konfirmasi',
    message: 'Apakah anda yakin akan menghapus Hukum Tajwid ini?',
    ok: {
      label: 'Ya',
      color: 'primary',
      flat: true
    },
    cancel: {
      label: 'Batal',
      color: 'negative',
      flat: true
    },
    persistent: true
  }).onOk(async () => {
    const payload = {
      is_deleted: 1
    }
    
    await axios.delete(`${api.API_BASE_URL}/sections/${section.id}`, {
      headers: authHeader()
    })

    $q.notify({
      type: 'positive',
      message: 'Hukum Tajwid berhasil dihapus',
      position: 'top',
      timeout: 2000
    })
    
    // Refresh data after deletion
    sections.value = []
    skipGurus.value = 0
    await fetchSection()
  }).onCancel(() => {
    console.log('Cancel Delete Tajwid:')
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

.q-badge {
  font-size: 0.65rem;
  padding: 2px 4px;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .welcome-title {
    font-size: 1.5rem;
  }
}
</style>