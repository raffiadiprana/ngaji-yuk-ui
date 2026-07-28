<template>
  <q-page class="module-page">

    <div class="page-container">
      <q-header elevated class="serene-header">
        <q-toolbar>
          <q-btn flat round dense icon="arrow_back" @click="goBack" />
          <q-toolbar-title class="header-title">{{ moduleData?.title || 'Materi' }}</q-toolbar-title>
          <q-btn v-if="isGuru || isAdmin" flat round dense icon="edit" @click="editModule" class="q-ml-sm" />
        </q-toolbar>
      </q-header>

      <div class="content-wrapper">
        <!-- Status + breadcrumb -->
        <div class="row items-center q-mt-md q-mb-xs no-wrap">
          <q-chip v-if="moduleData?.is_completed" color="serene-secondary-container" text-color="serene-on-secondary-container" size="sm" dense>Lulus</q-chip>
          <q-chip v-else-if="moduleData?.is_locked" color="grey-3" text-color="grey-8" size="sm" dense>Terkunci</q-chip>
          <q-chip v-else color="serene-primary-container" text-color="serene-on-primary-container" size="sm" dense>Siap Dipelajari</q-chip>
          <q-space />
          <span v-if="sectionName" class="text-caption text-serene-variant ellipsis">{{ sectionName }}</span>
        </div>

        <!-- Module Title -->
        <h1 class="module-title headline-font">{{ moduleData?.title || '' }}</h1>

        <!-- Video / Thumbnail -->
        <div v-if="videoReady" class="video-container q-mt-md serene-card">
          <video ref="videoPlayer" class="video-js vjs-default-skin vjs-big-play-centered" controls playsinline allowfullscreen></video>
        </div>
        <div v-else class="video-container q-mt-md serene-card serene-card-soft">
          <q-img :src="moduleData?.thumbnail ? `${api.API_UPLOADS_URL}/${moduleData.thumbnail}` : 'https://placehold.co/600x300'" class="video-placeholder">
            <q-icon name="play_circle" size="lg" class="play-icon" />
          </q-img>
        </div>

        <!-- Instructor -->
        <q-card flat bordered class="instructor-section q-mt-lg serene-card" v-if="moduleData?.instructor_profile?.display_name">
          <div class="row items-center">
            <q-avatar size="48px"><img :src="instructorAvatar" /></q-avatar>
            <div class="instructor-info q-ml-md">
              <div class="instructor-name">{{ moduleData.instructor_profile.display_name }}</div>
              <div class="instructor-title">{{ moduleData.instructor_profile.jobtitle || 'Guru Tajwid' }}</div>
            </div>
          </div>
        </q-card>

        <!-- The Rule -->
        <q-card class="rule-card q-mt-lg serene-card">
          <div class="row items-center q-mb-sm">
            <q-icon name="menu_book" color="serene-primary" size="sm" class="q-mr-sm" />
            <div class="text-subtitle1 text-weight-bold text-serene-on-surface">The Rule</div>
          </div>
          <div class="module-description">{{ moduleData?.description || 'Belum ada penjelasan untuk modul ini.' }}</div>
        </q-card>

        <!-- Chat CTA -->
        <q-card class="chat-cta q-mt-lg serene-card-soft">
          <div class="row items-center no-wrap">
            <q-avatar size="44px" class="bg-serene-primary-container text-serene-primary flex flex-center">
              <q-icon name="chat" />
            </q-avatar>
            <div class="col q-ml-md min-width-0">
              <div class="text-weight-bold text-serene-on-surface">Tanya Guru</div>
              <div class="text-caption text-serene-variant">Diskusikan materi ini dengan guru via chat.</div>
            </div>
            <q-btn
              v-if="quizes.length > 0"
              label="Lanjutkan Chat"
              class="serene-btn-primary q-ml-md"
              @click="goToAnswerPage(quizes[0])"
            />
            <q-btn
              v-else
              label="Mulai Chat"
              icon="chat"
              class="serene-btn-primary q-ml-md"
              :loading="startingChat"
              @click="startChat"
            />
          </div>
          <div v-if="quizes.length > 0 && isModulePassed" class="quiz-passed q-mt-sm">
            <q-icon name="verified" color="serene-secondary" size="sm" class="q-mr-xs" />Lulus oleh guru
          </div>
        </q-card>

        <!-- Next module (hanya kalau lulus) -->
        <div v-if="moduleData?.is_completed" class="next-module-banner q-mt-md">
          <q-icon name="verified" color="serene-secondary" size="sm" class="q-mr-xs" />
          <span class="text-weight-bold text-serene-secondary">Materi ini telah lulus.</span>
          <q-btn
            v-if="nextModuleId"
            label="Materi Selanjutnya"
            icon-right="arrow_forward"
            class="serene-btn-primary q-ml-md"
            @click="goToNextModule"
          />
          <q-btn v-else label="Kembali ke Kurikulum" icon-right="arrow_forward" class="serene-btn-primary q-ml-md" @click="router.push('/tajwid')" />
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
const sectionName = ref('');

const accessToken = localStorage.getItem('token');
const userId = Number(localStorage.getItem('id'));
const moduleId = route.params.id;

const role = localStorage.getItem('role')
const isGuru = computed(() => role === 'guru' || role === 'admin')
const isAdmin = computed(() => role === 'admin')

const editModule = () => router.push(`/module-form/${moduleId}`);

const videoPlayer = ref(null);
let player = null;
const videoReady = ref(false);

const instructorAvatar = computed(() => {
  return moduleData.value?.instructor_profile?.avatar
    ? `${api.API_UPLOADS_URL}/${moduleData.value.instructor_profile.avatar}`
    : 'https://placehold.co/100';
});

const goBack = () => router.go(-1);
const goToAnswerPage = (question) => router.push({ path: `/quiz-answer/${question.id}` });

// Next module (hanya kalau lulus)
const nextModuleId = ref(null);
const goToNextModule = () => {
  if (nextModuleId.value) router.push(`/module/${nextModuleId.value}`);
  else router.push('/tajwid');
};
const fetchNextModule = async () => {
  const cur = moduleData.value;
  if (!cur || cur.category === 'reference') return;
  try {
    const res = await axios.get(`${api.API_BASE_URL}/modules`, {
      headers: authHeader(),
      params: { is_deleted: 0, category: cur.category }
    });
    const mods = (res.data?.data || []).sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
    const idx = mods.findIndex(m => m.id === cur.id);
    if (idx >= 0 && idx + 1 < mods.length) nextModuleId.value = mods[idx + 1].id;
  } catch (e) { console.error(e); }
};

const startingChat = ref(false);
const startChat = async () => {
  startingChat.value = true;
  try {
    const res = await axios.post(`${api.API_BASE_URL}/quiz`, {
      question: `Pertanyaan dari santri mengenai modul ${moduleData.value?.title || moduleId}`,
      modules_id: Number(moduleId),
      media_id: 0,
      type: 'chat',
      answer_type: 'text',
      is_completed: 0,
      created_by: Number(userId),
    }, { headers: authHeader() });
    const newQuizId = res.data?.id || res.data?.data?.id;
    if (newQuizId) router.push({ path: `/quiz-answer/${newQuizId}` });
    else $q.notify({ type: 'negative', message: 'Gagal memulai chat.' });
  } catch (err) {
    console.error('Failed to start chat:', err);
    $q.notify({ type: 'negative', message: 'Gagal memulai chat. Coba lagi.' });
  } finally {
    startingChat.value = false;
  }
};

// Status lulus diambil dari moduleData.is_completed (dihitung resolver backend dari quiz.is_completed)
const isModulePassed = computed(() => !!moduleData.value?.is_completed);

function initVideoJs(videoId) {
  if (player) player.dispose();
  player = videojs(videoPlayer.value, {
    techOrder: ['youtube'],
    sources: [{ type: 'video/youtube', src: `https://www.youtube.com/watch?v=${videoId}` }],
    controls: true, autoplay: false, preload: 'auto',
    youtube: { modestbranding: 1, rel: 0, showinfo: 0, iv_load_policy: 3 },
    responsive: true, fluid: true
  });
  player.on('error', () => console.error('VideoJS Error:', player.error()));
}

onMounted(async () => {
  try {
    const [moduleRes, quizRes, secRes] = await Promise.all([
      axios.get(`${api.API_BASE_URL}/modules?id=${moduleId}`, { headers: authHeader() }),
      axios.get(`${api.API_BASE_URL}/quiz?modules_id=${moduleId}`, { headers: authHeader() }),
      axios.get(`${api.API_BASE_URL}/sections`, { headers: authHeader() })
    ]);
    moduleData.value = moduleRes.data.data[0] || null;
    quizes.value = quizRes.data.data;
    if (moduleData.value?.is_completed) await fetchNextModule();
    const secs = secRes.data?.data || [];
    const sec = secs.find(s => s.id === moduleData.value?.section_id);
    sectionName.value = sec?.section_name || '';

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

onBeforeUnmount(() => { if (player) { player.dispose(); player = null; } });
</script>

<style scoped>
.module-page { min-height: 100vh; background: var(--serene-bg); }
.page-container { position: relative; z-index: 1; max-width: 900px; margin: 0 auto; }
.content-wrapper { padding: 0 16px 40px; }
.header-title { font-size: 1.25rem; font-weight: 600; padding-left: 8px; }
.ellipsis { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.min-width-0 { min-width: 0; }

.module-title { font-size: 1.6rem; font-weight: 700; color: var(--serene-on-surface); margin: 4px 0 8px; }

.video-container { width: 100%; border-radius: 16px; overflow: hidden; margin-bottom: 8px; }
.video-js { width: 100%; height: 0; padding-bottom: 56.25%; }
.video-placeholder { width: 100%; height: 0; padding-bottom: 56.25%; position: relative; background-color: #f5f5f5; }
.play-icon { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 48px; color: white; opacity: 0.8; z-index: 1; }

.instructor-section { padding: 16px 20px; border-radius: 16px; background: white; }
.instructor-name { font-size: 1rem; font-weight: 600; color: var(--serene-on-surface); }
.instructor-title { font-size: 0.8rem; color: var(--serene-variant); margin-top: 2px; }

.rule-card { padding: 20px 24px; border-radius: 16px; }
.module-description { font-size: 1rem; color: var(--serene-variant); line-height: 1.7; margin-top: 4px; }

.chat-cta { padding: 16px 20px; border-radius: 16px; }
.quiz-passed { display: inline-flex; align-items: center; color: var(--serene-secondary); font-weight: 600; font-size: 0.85rem; }
.next-module-banner { background: var(--serene-secondary-container); border-radius: 16px; padding: 14px 18px; display: flex; align-items: center; flex-wrap: wrap; gap: 8px; }

@media (min-width: 600px) {
  .content-wrapper { padding: 0 24px 48px; }
  .header-title { font-size: 1.5rem; }
  .module-title { font-size: 2rem; }
  .video-js { height: 450px; padding-bottom: 0; }
  .instructor-name { font-size: 1.1rem; }
  .module-description { font-size: 1.05rem; }
}
@media (min-width: 1024px) {
  .content-wrapper { padding: 0; }
}
</style>
