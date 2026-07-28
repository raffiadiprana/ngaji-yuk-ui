<template>
  <q-page class="module-page">

    <div class="page-container">
      <!-- Header with Back Button -->
      <q-header elevated class="serene-header">
        <q-toolbar>
          <q-btn flat round dense icon="arrow_back" @click="goBack" />
          <q-toolbar-title class="header-title">{{ moduleData?.title || 'Materi' }}</q-toolbar-title>
          <q-btn v-if="isGuru || isAdmin" flat round dense icon="edit" @click="editModule" class="q-ml-sm" />
        </q-toolbar>
      </q-header>

      <div class="content-wrapper">
        <!-- Video Player Section -->
        <div v-if="videoReady" class="video-container q-mt-md serene-card">
          <video
            ref="videoPlayer"
            class="video-js vjs-default-skin vjs-big-play-centered"
            controls
            playsinline
            allowfullscreen
          ></video>
        </div>
        <div v-else class="video-container q-mt-md serene-card serene-card-soft">
          <q-img
            :src="moduleData?.thumbnail || 'https://placehold.co/600x300'"
            class="video-placeholder"
          >
            <q-icon name="play_circle" size="lg" class="play-icon" />
          </q-img>
        </div>

        <!-- Instructor Profile Section -->
        <q-card flat bordered class="instructor-section q-mt-lg serene-card">
          <div class="row items-center">
            <q-avatar size="56px">
              <img :src="instructorAvatar" />
            </q-avatar>
            <div class="instructor-info q-ml-md">
              <div class="instructor-name">{{ moduleData?.instructor_profile?.display_name || '' }}</div>
              <div class="instructor-title">{{ moduleData?.instructor_profile?.jobtitle || '' }}</div>
            </div>
          </div>
        </q-card>

        <!-- Module Info Section -->
        <div class="module-info q-mt-lg serene-card">
          <div class="module-title">{{ moduleData?.title || '' }}</div>
          <div class="module-description">{{ moduleData?.description || '' }}</div>
        </div>

        <!-- Tabs Section -->
        <div class="tabs-section q-mt-lg serene-card">
          <q-tabs v-model="tab" class="serene-tabs">
            <q-tab name="quiz" />
          </q-tabs>

          <q-tab-panels v-model="tab" animated>
            <!-- Chat Tab -->
            <q-tab-panel name="quiz" class="q-pa-none">
              <div class="quiz-section">
                <q-card
                  v-if="quizes.length > 0"
                  class="quiz-card q-mt-md serene-card-soft"
                >
                  <q-card-section>
                    <div class="quiz-question">Percakapan Modul</div>
                    <div class="quiz-text">{{ quizes[0].question }}</div>
                    <div class="quiz-actions row items-center justify-between">
                      <q-btn
                        label="Lanjutkan Chat"
                        class="serene-btn-primary"
                        @click="goToAnswerPage(quizes[0])"
                      />
                      <div v-if="isPassed[quizes[0].id]" class="quiz-passed">
                        Lulus
                      </div>
                    </div>
                  </q-card-section>
                </q-card>

                <div v-else class="empty-state text-serene-variant q-py-lg column items-center">
                  <q-icon name="chat" size="40px" color="serene-primary" class="q-mb-sm" />
                  <div class="q-mb-md text-center">Belum ada percakapan. Mulai chat dengan guru untuk bertanya seputar modul ini.</div>
                  <q-btn
                    label="Mulai Chat"
                    icon="chat"
                    class="serene-btn-primary"
                    :loading="startingChat"
                    @click="startChat"
                  />
                </div>
              </div>
            </q-tab-panel>
          </q-tab-panels>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import axios from 'axios';
import api from 'src/config/api'
import { authHeader } from 'src/config/auth';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import 'videojs-youtube';

const router = useRouter();
const route = useRoute();
const $q = useQuasar();

const tab = ref('quiz');
const moduleData = ref(null);
const quizes = ref([]);
const isPassed = ref({});

const accessToken = localStorage.getItem('token');
const userId = Number(localStorage.getItem('id'));
const moduleId = route.params.id;

const role = localStorage.getItem('role')
const isGuru = computed(() => role === 'guru' || role === 'admin')
const isAdmin = computed(() => role === 'admin')

const editModule = () => {
  router.push(`/module-form/${moduleId}`)
};

const videoPlayer = ref(null);
let player = null;
const videoReady = ref(false);

// Computed properties
const instructorAvatar = computed(() => {
  return moduleData.value?.instructor_profile?.avatar 
    ? `${api.API_UPLOADS_URL}/${moduleData.value.instructor_profile.avatar}`
    : 'https://placehold.co/100';
});

// Methods
const goBack = () => router.go(-1);

const goToAnswerPage = (question) => {
  router.push({ path: `/quiz-answer/${question.id}` });
};

// Santri memulai chat baru dengan guru tanpa perlu guru membuat pertanyaan dulu
const startingChat = ref(false);
const startChat = async () => {
  startingChat.value = true;
  try {
    const res = await axios.post(
      `${api.API_BASE_URL}/quiz`,
      {
        question: `Pertanyaan dari santri mengenai modul ${moduleData.value?.title || moduleId}`,
        modules_id: Number(moduleId),
        media_id: 0,
        type: 'chat',
        answer_type: 'text',
        is_completed: 0,
        created_by: Number(userId),
      },
      { headers: authHeader() }
    );
    const newQuizId = res.data?.id || res.data?.data?.id;
    if (newQuizId) {
      router.push({ path: `/quiz-answer/${newQuizId}` });
    } else {
      $q.notify({ type: 'negative', message: 'Gagal memulai chat.' });
    }
  } catch (err) {
    console.error('Failed to start chat:', err);
    $q.notify({ type: 'negative', message: 'Gagal memulai chat. Coba lagi.' });
  } finally {
    startingChat.value = false;
  }
};

const checkIfQuizPassed = async (quizId) => {
  try {
    const response = await axios.get(`${api.API_BASE_URL}/answers`, {
      headers: authHeader(),
      params: { quiz_id: quizId, reply_to: userId, is_passed: 1 }
    });
    isPassed.value[quizId] = response.data?.data?.length > 0;
  } catch (error) {
    console.error('Failed to check quiz status:', error);
  }
};

function initVideoJs(videoId) {
  if (player) player.dispose();

  player = videojs(videoPlayer.value, {
    techOrder: ['youtube'],
    sources: [{
      type: 'video/youtube',
      src: `https://www.youtube.com/watch?v=${videoId}`
    }],
    controls: true,
    autoplay: false,
    preload: 'auto',
    youtube: { 
      modestbranding: 1, 
      rel: 0, 
      showinfo: 0,
      iv_load_policy: 3
    },
    responsive: true,
    fluid: true
  });

  player.on('error', () => {
    console.error('VideoJS Error:', player.error());
  });
}

// Lifecycle Hooks
onMounted(async () => {
  try {
    const [moduleRes, quizRes] = await Promise.all([
      axios.get(`${api.API_BASE_URL}/modules?id=${moduleId}`, {
        headers: authHeader(),
      }),
      axios.get(`${api.API_BASE_URL}/quiz?modules_id=${moduleId}`, {
        headers: authHeader(),
      })
    ]);

    moduleData.value = moduleRes.data.data[0] || null;
    quizes.value = quizRes.data.data;

    // Check completion status
    await Promise.all([
      ...quizes.value.map(quiz => checkIfQuizPassed(quiz.id))
    ]);

    // Initialize video if available
    const raw = moduleData.value?.video_header_id || '';
    const match = raw.match(/(?:youtu\.be\/|v=)([^&]+)/);
    const videoId = match?.[1];
    if (videoId) {
      videoReady.value = true;
      await nextTick();
      initVideoJs(videoId);
    }

  } catch (error) {
    console.error('Failed to fetch data:', error);
  }
});

onBeforeUnmount(() => {
  if (player) {
    player.dispose();
    player = null;
  }
});
</script>

<style scoped>
/* Layout */
.module-page {
  min-height: 100vh;
  background: var(--serene-bg);
}

.page-container {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
}

.content-wrapper {
  padding: 0 16px;
}

/* Header */
.header-title {
  font-size: 1.25rem;
  font-weight: 600;
  padding-left: 8px;
}

/* Video Container */
.video-container {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 32px;
}

.video-js {
  width: 100%;
  height: 0;
  padding-bottom: 56.25%; /* 16:9 Aspect Ratio */
}

.video-placeholder {
  width: 100%;
  height: 0;
  padding-bottom: 56.25%;
  position: relative;
  background-color: #f5f5f5;
}

.play-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 48px;
  color: white;
  opacity: 0.8;
  z-index: 1;
}

/* Instructor Section */
.instructor-section {
  padding: 24px;
  margin: 32px auto;
  max-width: 800px;
  border-radius: 16px;
  background: white;
}

.instructor-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--serene-on-surface);
}

.instructor-title {
  font-size: 0.875rem;
  color: var(--serene-variant);
  margin-top: 4px;
  margin-bottom: 4px;
}

/* Module Info */
.module-info {
  max-width: 800px;
  margin: 0 auto 32px;
  padding: 24px;
}

.module-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--serene-on-surface);
  margin-bottom: 8px;
}

.module-description {
  font-size: 1rem;
  color: var(--serene-variant);
  line-height: 1.6;
  margin-top: 5px;
}

/* Tabs Section */
.tabs-section {
  max-width: 800px;
  margin: 0 auto;
  padding: 8px 24px 24px;
}

.serene-tabs {
  display: none;
}

.passed-icon {
  color: var(--serene-secondary);
  font-size: 1.5rem;
}

/* Quiz Tab */
.quiz-section {
  padding: 8px 0;
}

.quiz-card {
  border-radius: 16px;
}

.quiz-question {
  font-size: 1rem;
  font-weight: 600;
  color: var(--serene-on-surface);
}

.quiz-text {
  font-size: 0.9375rem;
  color: var(--serene-variant);
  margin: 8px 0 16px;
  line-height: 1.5;
}

.quiz-passed {
  padding: 4px 12px;
  background: var(--serene-surface);
  color: var(--serene-secondary);
  border-radius: 16px;
  font-weight: 600;
  font-size: 0.875rem;
}

.empty-state {
  text-align: center;
  font-size: 0.9375rem;
}

/* Responsive Breakpoints */
@media (min-width: 600px) {
  .content-wrapper {
    padding: 0 24px;
  }
  
  .header-title {
    font-size: 1.5rem;
  }
  
  .video-js {
    height: 450px;
    padding-bottom: 0;
  }
  
  .instructor-name {
    font-size: 1.2rem;
  }
  
  .module-title {
    font-size: 1.5rem;
  }
  
  .module-description {
    font-size: 1.05rem;
  }
}

@media (min-width: 1024px) {
  .content-wrapper {
    padding: 0;
  }
  
  .quiz-question {
    font-size: 1.1rem;
  }
  
  .quiz-text {
    font-size: 1rem;
  }
}
</style>