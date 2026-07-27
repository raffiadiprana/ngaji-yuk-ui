<template>
  <div class="guru-page">
    <div class="aurora-bg" aria-hidden="true">
      <span class="aurora a1" />
      <span class="aurora a2" />
      <span class="aurora a3" />
    </div>

    <div class="page-container q-pa-md">
      <!-- Welcome Section -->
      <div class="welcome-section serene-card">
        <div class="welcome-content">
          <h4 class="welcome-title">
            Welcome <span class="text-serene-primary">{{ profile.display_name || 'Guest' }}</span>
          </h4>
          <p class="welcome-subtitle">Kelola modul, materi, dan quiz pembelajaran tajwid</p>
        </div>
        <q-avatar size="48px" class="profile-avatar" @click="$router.push('/profile')">
          <img :src="profile.avatar ? api.API_UPLOADS_URL + '/' + profile.avatar : 'https://placehold.co/100?text=👤'" alt="Avatar" />
        </q-avatar>
      </div>

      <!-- Module Section -->
      <div class="section-card serene-card q-mt-lg">
        <div class="section-header">
          <h5 class="section-title">
            <q-icon name="collections_bookmark" color="serene-primary" class="q-mr-sm" />
            Daftar Modul Tajwid
          </h5>
          <q-btn
            label="Tambah Modul"
            icon="add"
            rounded
            dense
            class="serene-btn-primary"
            @click="onAddModule"
          />
        </div>

        <div class="card-grid">
          <q-card
            v-for="course in courses"
            :key="course.id"
            class="content-card interactive hover-lift"
            @click="editCourse(course)"
          >
            <q-card-section class="card-header">
              <q-icon name="collections_bookmark" color="serene-primary" size="sm" />
              <div class="text-subtitle1 text-weight-bold q-ml-sm">{{ course.title }}</div>
            </q-card-section>

            <q-separator />

            <q-card-actions align="right" class="card-actions">
              <q-btn flat round dense icon="more_vert" @click.stop>
                <q-menu auto-close>
                  <q-list>
                    <q-item clickable @click="editCourse(course)">
                      <q-item-section avatar>
                        <q-icon name="edit" color="serene-primary" />
                      </q-item-section>
                      <q-item-section>Edit</q-item-section>
                    </q-item>
                    <q-item clickable @click="deleteModul(course)">
                      <q-item-section avatar>
                        <q-icon name="delete" color="negative" />
                      </q-item-section>
                      <q-item-section>Hapus</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </q-card-actions>
          </q-card>
        </div>

        <q-btn
          v-if="hasMoreCourses"
          label="Tampilkan lebih banyak"
          outline
          class="serene-btn-outline full-width q-mt-md"
          @click="loadMoreCourses"
          :loading="loadingCourses"
        />
      </div>

      <!-- Lessons Section -->
      <div class="section-card serene-card q-mt-lg">
        <div class="section-header">
          <h5 class="section-title">
            <q-icon name="ondemand_video" color="serene-primary" class="q-mr-sm" />
            Daftar Materi Tajwid
          </h5>
          <q-btn
            label="Tambah Materi"
            icon="add"
            rounded
            dense
            class="serene-btn-primary"
            @click="onAddLesson"
          />
        </div>

        <div class="card-grid">
          <q-card
            v-for="lesson in lessons"
            :key="lesson.id"
            class="content-card interactive hover-lift"
            @click="editLesson(lesson)"
          >
            <q-card-section class="card-header">
              <q-icon name="ondemand_video" color="serene-primary" size="sm" />
              <div class="text-subtitle1 text-weight-bold q-ml-sm">{{ lesson.title }}</div>
            </q-card-section>

            <q-separator />

            <q-card-actions align="right" class="card-actions">
              <q-btn flat round dense icon="more_vert" @click.stop>
                <q-menu auto-close>
                  <q-list>
                    <q-item clickable @click="editLesson(lesson)">
                      <q-item-section avatar>
                        <q-icon name="edit" color="serene-primary" />
                      </q-item-section>
                      <q-item-section>Edit</q-item-section>
                    </q-item>
                    <q-item clickable @click="deleteLesson(lesson)">
                      <q-item-section avatar>
                        <q-icon name="delete" color="negative" />
                      </q-item-section>
                      <q-item-section>Hapus</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </q-card-actions>
          </q-card>
        </div>

        <q-btn
          v-if="hasMoreLessons"
          label="Tampilkan lebih banyak"
          outline
          class="serene-btn-outline full-width q-mt-md"
          @click="loadMoreLessons"
          :loading="loadingLessons"
        />
      </div>

      <!-- Quiz Section -->
      <div class="section-card serene-card q-mt-lg">
        <div class="section-header">
          <h5 class="section-title">
            <q-icon name="quiz" color="serene-primary" class="q-mr-sm" />
            Daftar Quiz
          </h5>
          <q-btn
            label="Tambah Quiz"
            icon="add"
            rounded
            dense
            class="serene-btn-primary"
            @click="onAddQuiz"
          />
        </div>

        <div class="card-grid">
          <q-card
            v-for="quiz in quizzes"
            :key="quiz.id"
            class="content-card interactive hover-lift"
            @click="editQuiz(quiz)"
          >
            <q-card-section class="card-header">
              <q-icon name="quiz" color="serene-primary" size="sm" />
              <div class="text-subtitle1 text-weight-bold q-ml-sm ellipsis-text">{{ quiz.question }}</div>
            </q-card-section>

            <q-separator />

            <q-card-actions align="right" class="card-actions">
              <q-btn flat round dense icon="more_vert" @click.stop>
                <q-menu auto-close>
                  <q-list>
                    <q-item clickable @click="editQuiz(quiz)">
                      <q-item-section avatar>
                        <q-icon name="edit" color="serene-primary" />
                      </q-item-section>
                      <q-item-section>Edit</q-item-section>
                    </q-item>
                    <q-item clickable @click="deleteQuiz(quiz)">
                      <q-item-section avatar>
                        <q-icon name="delete" color="negative" />
                      </q-item-section>
                      <q-item-section>Hapus</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </q-card-actions>
          </q-card>
        </div>

        <q-btn
          v-if="hasMoreQuizzes"
          label="Tampilkan lebih banyak"
          outline
          class="serene-btn-outline full-width q-mt-md"
          @click="loadMoreQuizzes"
          :loading="loadingQuizzes"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
  import { useQuasar } from 'quasar'
  const $q = useQuasar()
  import { ref, onMounted } from "vue";
  import { useRouter } from "vue-router";
  import axios from "axios";
  import api from "src/config/api";
  import { authHeader } from "src/config/auth";
  
  const router = useRouter();
  
  const profile = ref({});
  const courses = ref([]);
  const quizzes = ref([]);
  const lessons = ref([]);
  const accessToken = localStorage.getItem('token');
  const instructorId = localStorage.getItem('id');
  
  // Paging for Courses
  const skipCourses = ref(0);
  const limitCourses = 10;
  const loadingCourses = ref(false);
  const hasMoreCourses = ref(true);

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
    await fetchCourses();
    await fetchQuizzes();
    await fetchLessons();
  });
  
  // Fungsi untuk mengambil data kursus berdasarkan skip dan limit
  const fetchCourses = async () => {
    if (loadingCourses.value) return;
    loadingCourses.value = true;
  
    try {
      const res = await axios.get(`${api.API_BASE_URL}/modules`, {
        headers: authHeader(),
        params: { 
          instructor_id: instructorId,
          $skip: skipCourses.value, 
          $limit: limitCourses
        }
      });
      
      const fetchedCourses = res.data.data || [];
      
      if (fetchedCourses.length > 0) {
        courses.value.push(...fetchedCourses);
      }
  
      hasMoreCourses.value = fetchedCourses.length === limitCourses;
  
    } catch (err) {
      console.error('Failed to fetch courses:', err);
    } finally {
      loadingCourses.value = false;
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
    if (!loadingCourses.value && hasMoreCourses.value) {
      skipCourses.value += limitCourses;
      fetchCourses();
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
  
  const onAddModule = () => {
    router.push('/module-form');
  };

  const onAddQuiz = () => {
    router.push('/quiz-form');
  };

  const onAddLesson = () => {
    router.push('/lesson-form');
  };
  
  const editCourse = (course) => {
    router.push(`/module-form/${course.id}`);
  };
  
  const deleteModul = (module) => {
    console.log('Delete modul:', module);
    $q.dialog({
      title: 'Konfirmasi',
      message: 'Apakah anda yakin akan menghapus Modul Tajwid ini ?',
      ok: {
        label: 'Ya',
        color: 'primary'
      },
      cancel: {
        label: 'Kembali',
        color: 'red'
      }
    }).onOk(async () => {
      const payload = {
        is_deleted : 1
      }
      
      await axios.patch(`${api.API_BASE_URL}/modules/${module.id}`, payload, {
        headers: authHeader()
      })

      $q.dialog({
        title: 'Berhasil',
        message: 'Modul berhasil dihapus',
        ok: {
          label: 'OK',
          color: 'primary'
        }
      }).onOk(() => {
        location.reload()
      })

    }).onCancel(() => {
      console.log('Cancel Delete modul:')
    })
  };

  const editQuiz = (quiz) => {
    router.push(`/quiz-form/${quiz.id}`);
  };
  
  const deleteQuiz = (quiz) => {
    console.log('Delete quiz:', quiz);
    $q.dialog({
      title: 'Konfirmasi',
      message: 'Apakah anda yakin akan menghapus Quiz ini?',
      ok: {
        label: 'Ya',
        color: 'primary'
      },
      cancel: {
        label: 'Kembali',
        color: 'red'
      }
    }).onOk(async () => {
      const payload = {
        is_deleted : 1
      }
      
      await axios.patch(`${api.API_BASE_URL}/quiz/${quiz.id}`, payload, {
        headers: authHeader()
      })

      $q.dialog({
        title: 'Berhasil',
        message: 'Quiz berhasil dihapus',
        ok: {
          label: 'OK',
          color: 'primary'
        }
      }).onOk(() => {
        location.reload()
      })

    }).onCancel(() => {
      console.log('Cancel Delete quiz:')
    })
  };

  const editLesson = (lesson) => {
    router.push(`/lesson-form/${lesson.id}`);
  };

  const deleteLesson = (lesson) => {
    $q.dialog({
      title: 'Konfirmasi',
      message: 'Apakah anda yakin akan menghapus Materi Tajwid ini?',
      ok: {
        label: 'Ya',
        color: 'primary'
      },
      cancel: {
        label: 'Kembali',
        color: 'red'
      }
    }).onOk(async () => {
      const payload = {
        is_deleted : 1
      }
      
      await axios.patch(`${api.API_BASE_URL}/lessons/${lesson.id}`, payload, {
        headers: authHeader()
      })

      $q.dialog({
        title: 'Berhasil',
        message: 'Materi Tajwid berhasil dihapus',
        ok: {
          label: 'OK',
          color: 'primary'
        }
      }).onOk(() => {
        location.reload()
      })

    }).onCancel(() => {
      console.log('Cancel Delete lesson:')
    })
  }

</script>

<style scoped>
  .guru-page {
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
    max-width: 1200px;
    margin: 0 auto;
  }

  .welcome-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px;
    margin-bottom: 24px;
  }

  .welcome-content {
    flex: 1;
  }

  .welcome-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--serene-on-surface);
    margin-bottom: 4px;
  }

  .welcome-subtitle {
    font-size: 1rem;
    color: var(--serene-variant);
  }

  .profile-avatar {
    cursor: pointer;
    border: 2px solid var(--serene-border);
    transition: transform 0.2s;
  }

  .profile-avatar:hover {
    transform: scale(1.05);
  }

  .section-card {
    background: white;
    border-radius: 16px;
    padding: 24px;
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
    font-weight: 700;
    color: var(--serene-on-surface);
    display: flex;
    align-items: center;
  }

  .card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
  }

  .content-card {
    border-radius: 16px;
    transition: all 0.3s ease;
    cursor: pointer;
    box-shadow: 0 2px 15px rgba(0, 0, 0, 0.05);
  }

  .content-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
  }

  .card-header {
    display: flex;
    align-items: center;
    padding: 16px;
  }

  .card-actions {
    padding: 8px;
  }

  .ellipsis-text {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 200px;
  }

  @media (max-width: 768px) {
    .card-grid {
      grid-template-columns: 1fr;
    }

    .section-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }

    .welcome-section {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }
  }
</style>
