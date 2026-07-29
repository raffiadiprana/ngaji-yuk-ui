<template>
  <!-- ModulePage v2026-07-29b -->
  <q-page class="module-page">
    <div class="page-container">
      <div class="lesson-header q-mb-md">
        <div class="row items-center no-wrap">
          <q-btn flat round dense icon="arrow_back" @click="goBack" class="q-mr-sm" />
          <div class="col min-width-0">
            <div class="text-caption text-serene-variant ellipsis">{{ sectionName }}</div>
            <div class="text-h6 text-serene-on-surface ellipsis">{{ moduleData?.title || 'Materi' }}</div>
          </div>
          <q-chip v-if="moduleData?.is_completed" color="serene-secondary-container" text-color="serene-on-secondary-container" size="sm" dense>Selesai</q-chip>
          <q-chip v-else-if="moduleData?.is_locked" color="grey-3" text-color="grey-8" size="sm" dense>Terkunci</q-chip>
          <q-chip v-else color="serene-primary-container" text-color="serene-on-primary-container" size="sm" dense>Siap</q-chip>
        </div>
        <div class="progress-track q-mt-sm">
          <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
        </div>
        <div class="text-caption text-serene-variant q-mt-xs">Modul {{ currentOrder }} dari {{ totalCount }}</div>
      </div>

      <div class="lesson-layout flex justify-center">
        <div class="col-12 col-md-8 col-lg-7">
          <div v-if="currentPage === 1" class="lesson-card video-page">
            <div class="video-wrap">
              <div v-if="videoReady" class="video-player">
                <video ref="videoPlayer" class="vjs-default-skin vjs-big-play-centered" controls playsinline allowfullscreen></video>
              </div>
              <div v-else class="video-placeholder">
                <q-img :src="moduleData?.thumbnail ? `${api.API_UPLOADS_URL}/${moduleData.thumbnail}` : 'https://placehold.co/600x300'" class="video-thumb">
                  <q-icon name="play_circle" size="lg" class="play-icon" />
                </q-img>
              </div>
            </div>
            <div class="example-chip q-mt-md">Video Pembelajaran</div>
            <div class="ayah-row q-mt-lg row items-center justify-between">
              <q-btn flat round dense icon="chevron_left" :disable="!hasPrevContent" @click="goPrevContent" />
              <div class="text-caption text-serene-variant">Halaman {{ currentPage }} dari {{ totalPages }}</div>
              <q-btn flat round dense icon="chevron_right" :disable="!hasNextContent" @click="goNextContent" />
            </div>
          </div>

          <div v-else class="lesson-card content-page">
            <div v-if="displayAyat" class="ayah-text q-mt-md">
              <div class="ayah-arabic arabic-font" dir="rtl" v-html="highlightedAyah"></div>
              <div class="ayah-translit">{{ displayAyahTranslit }}</div>
              <div class="ayah-ref">{{ displayAyahRef }}</div>
              <q-btn v-if="voiceNoteUrl" outline round color="serene-primary" icon="volume_up" class="q-mt-md" @click="playVoiceNote" />
            </div>
            <div class="ayah-row q-mt-lg row items-center justify-between">
              <q-btn flat round dense icon="chevron_left" :disable="!hasPrevContent" @click="goPrevContent" />
              <div class="text-caption text-serene-variant">Halaman {{ currentPage }} dari {{ totalPages }}</div>
              <q-btn flat round dense icon="chevron_right" :disable="!hasNextContent" @click="goNextContent" />
            </div>
          </div>

          <div class="q-mt-md">
            <q-card class="chat-cta serene-card-soft">
              <div class="row items-center no-wrap">
                <q-avatar size="44px" class="bg-serene-primary-container text-serene-primary flex flex-center"><q-icon name="chat" /></q-avatar>
                <div class="col q-ml-md min-width-0">
                  <div class="text-weight-bold text-serene-on-surface">Tanya Guru</div>
                  <div class="text-caption text-serene-variant">Diskusikan materi ini dengan guru via chat.</div>
                </div>
                <q-btn v-if="quizes.length" label="Lanjutkan Chat" class="serene-btn-primary q-ml-md" @click="goToAnswerPage(quizes[0])" />
                <q-btn v-else label="Mulai Chat" icon="chat" class="serene-btn-primary q-ml-md" :loading="startingChat" @click="startChat" />
              </div>
              <div v-if="quizes.length && isPassed" class="quiz-passed q-mt-sm">
                <q-icon name="verified" color="serene-secondary" size="sm" class="q-mr-xs" />Lulus oleh guru
              </div>
            </q-card>
            <div v-if="moduleData?.is_completed" class="next-module-banner q-mt-md">
              <q-icon name="verified" color="serene-secondary" size="sm" class="q-mr-xs" />
              <span class="text-weight-bold text-serene-secondary">Materi ini telah lulus.</span>
              <q-btn v-if="nextModuleId" label="Materi Selanjutnya" icon-right="arrow_forward" class="serene-btn-primary q-ml-md" @click="goToNextModule" />
              <q-btn v-else label="Kembali ke Kurikulum" icon-right="arrow_forward" class="serene-btn-primary q-ml-md" @click="$router.push('/tajwid')" />
            </div>
          </div>
        </div>

        <div class="col-12 col-md-5">
          <div class="rule-stack">
            <q-card class="rule-card serene-card">
              <div class="card-title">Atribut</div>
              <div class="rule-text">{{ moduleData?.description || 'Belum ada penjelasan untuk modul ini.' }}</div>
              <div v-if="ruleLetters.length" class="letter-chips q-mt-sm">
                <q-chip v-for="ch in ruleLetters" :key="ch" dense outline color="serene-primary" text-color="serene-primary" class="letter-chip">{{ ch }}</q-chip>
              </div>
            </q-card>

            <q-card class="attr-card serene-card q-mt-md">
              <div class="card-title">Atribut</div>
              <div class="info-cards row q-col-gutter-sm">
                <div class="col-12">
                  <div class="info-card ghunnah-card">
                    <div class="info-icon"><q-icon name="volume_up" /></div>
                    <div class="info-body">
                      <div class="info-name">Suara Nasal (Ghunnah)</div>
                      <div class="info-desc">{{ ghunnahFull }}</div>
                    </div>
                  </div>
                </div>
                <div class="col-12">
                  <div class="info-card duration-card">
                    <div class="info-icon"><q-icon name="timer" /></div>
                    <div class="info-body">
                      <div class="info-name">Durasi</div>
                      <div class="info-desc">{{ moduleData?.duration || 2 }} Beats — Tahan dengung hidung selama sekitar {{ moduleData?.duration || 2 }} ketukan.</div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="pro-tip q-mt-md"><b>Tips:</b> {{ proTipText }}</div>
            </q-card>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, nextTick, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import axios from 'axios';
import api from 'src/config/api';
import { authHeader } from 'src/config/auth';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import 'videojs-youtube';

const router = useRouter();
const route = useRoute();
const $q = useQuasar();
const moduleId = route.params.id;
const videoPlayer = ref(null);
let player = null;

const moduleData = ref(null);
const quizes = ref([]);
const isPassed = ref(false);
const sectionName = ref('');
const startingChat = ref(false);
const nextModuleId = ref(null);

const currentPage = ref(1);
const videoReady = ref(false);
const totalPages = computed(() => 2); // Page 1: Video, Page 2: Konten Materi (selalu ada)
const hasPrevContent = computed(() => currentPage.value > 1);
const hasNextContent = computed(() => currentPage.value < totalPages.value);

const ayahMap = {
  10: { arabic: 'إِنَّا أَنْزَلْنَاهُ قُرْآنًا عَرَبِيًّا', translit: 'Inna anzalnahu quranan arabiyyan', ref: 'QS. Yusuf: 2' },
  11: { arabic: 'وَلَرَبُّكَ أَكْرَمٌ عَظِيمٌ', translit: 'Wa rabbuka akramun adzimun', ref: 'QS. Al-Kautsar: 1' },
  12: { arabic: 'وَمِنَ النَّاسِ مَن يَشْتَرِي لَهْوَ الْحَدِيثِ', translit: 'Wa minan-nasi man yasytari lahwal-hadits', ref: 'QS. Luqman: 6' },
  13: { arabic: 'لَا يُحِبُّ اللَّهُ الْجَهْرَ بِالسُّوءِ', translit: 'La yuhabbullahul-jahras-sui', ref: 'QS. An-Nisa: 148' },
  14: { arabic: 'فَاقْرَءُوا مَا تَيَسَّرَ مِنَ الْقُرْآنِ', translit: 'Faqrau maa yayassara minal-quran', ref: 'QS. Al-Muzzammil: 20' }
};
const highlightWordsByModule = {
  10: ['قُرْآنًا'],
  11: ['أَكْرَمٌ'],
  12: ['لَهْوَ'],
  13: ['الْجَهْرَ'],
  14: ['مَا تَيَسَّرَ']
};
const displayAyahTranslit = computed(() => ayahMap[moduleData.value?.id]?.translit || '');
const displayAyahRef = computed(() => ayahMap[moduleData.value?.id]?.ref || '');
const displayAyat = computed(() => !!(ayahMap[moduleData.value?.id]?.arabic));
const highlightedAyah = computed(() => {
  const raw = ayahMap[moduleData.value?.id]?.arabic || '';
  const words = highlightWordsByModule[moduleData.value?.id] || [];
  if (!words.length) return raw;
  let html = raw;
  words.forEach(w => {
    html = html.replace(new RegExp(w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), `<span class="highlight-red">${w}</span>`);
  });
  return html;
});
const voiceNoteUrl = computed(() => moduleData.value?.voice_note_url || '');
const playVoiceNote = () => {
  const url = voiceNoteUrl.value;
  if (!url) return;
  const audio = new Audio(`${api.API_UPLOADS_URL}/${url}`);
  audio.play().catch(() => $q.notify({ type: 'negative', message: 'Gagal memutar suara.' }));
};

const goPrevContent = () => { if (currentPage.value > 1) currentPage.value--; };
const goNextContent = () => { if (currentPage.value < totalPages.value) currentPage.value++; };

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

const goBack = () => router.go(-1);
const goToAnswerPage = (question) => router.push({ path: `/quiz-answer/${question.id}` });
const goToNextModule = () => { if (nextModuleId.value) router.push(`/module/${nextModuleId.value}`); else router.push('/tajwid'); };
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
      created_by: Number(localStorage.getItem('id')),
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

const fetchNextModule = async () => {
  const cur = moduleData.value;
  if (!cur || cur.category === 'reference') return;
  try {
    const res = await axios.get(`${api.API_BASE_URL}/modules`, {
      headers: authHeader(),
      params: { is_deleted: 0, category: cur.category, '$limit': 100 }
    });
    const mods = (res.data?.data || []).sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
    const idx = mods.findIndex(m => m.id === cur.id);
    if (idx >= 0 && idx + 1 < mods.length) nextModuleId.value = mods[idx + 1].id;
  } catch (e) { console.error(e); }
};

onMounted(async () => {
  try {
    const [moduleRes, quizRes, secRes] = await Promise.all([
      axios.get(`${api.API_BASE_URL}/modules?id=${moduleId}`, { headers: authHeader() }),
      axios.get(`${api.API_BASE_URL}/quiz?modules_id=${moduleId}`, { headers: authHeader() }),
      axios.get(`${api.API_BASE_URL}/sections`, { headers: authHeader() })
    ]);
    moduleData.value = moduleRes.data.data[0] || null;
    quizes.value = quizRes.data.data || [];
    const secs = secRes.data?.data || [];
    const sec = secs.find(s => s.id === moduleData.value?.section_id);
    sectionName.value = sec?.section_name || '';
    isPassed.value = !!moduleData.value?.is_completed;
    if (moduleData.value?.is_completed) await fetchNextModule();

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
.page-container { max-width: 1100px; margin: 0 auto; padding: 24px 16px 48px; }
.lesson-header { background: #fff; border-radius: 16px; padding: 16px 20px; border: 1px solid var(--serene-border); }
.progress-track { height: 8px; background: var(--serene-surface-container-low); border-radius: 999px; overflow: hidden; }
.progress-fill { height: 100%; background: var(--serene-primary); border-radius: 999px; transition: width .3s ease; }
.lesson-layout { margin-top: 20px; }
.lesson-card { background: #e6f4ea; border-radius: 24px; padding: 32px 24px; text-align: center; position: relative; overflow: hidden; min-height: 420px; display: flex; flex-direction: column; align-items: center; justify-content: center; max-width: 960px; margin-inline: auto; }
.video-wrap, .video-player, .video-placeholder { width: 100%; }
.video-player { height: 0; padding-bottom: 56.25%; position: relative; }
.video-player video { position: absolute; inset: 0; width: 100%; height: 100%; }
.video-thumb { width: 100%; height: 0; padding-bottom: 56.25%; }
.play-icon { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 48px; color: white; opacity: .9; z-index: 1; }
.example-chip { position: absolute; top: 16px; left: 16px; background: var(--serene-primary); color: #fff; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 600; }
.arabic-display { font-size: 3rem; color: var(--serene-on-surface); line-height: 1.4; margin-top: 16px; font-family: 'Noto Serif', serif; }
.transliteration { font-size: 1.1rem; color: var(--serene-primary); font-weight: 600; margin-top: 10px; font-style: italic; }
.meaning-text { font-size: 0.95rem; color: var(--serene-on-surface-variant); margin-top: 8px; }
.ayah-text { background: #fff; border-radius: 16px; padding: 16px 20px; margin-top: 12px; }
.ayah-arabic { font-size: 2rem; color: var(--serene-on-surface); line-height: 1.6; font-family: 'Noto Serif', serif; }
.highlight-red { color: #d32f2f; font-weight: 800; }
.ayah-translit { font-size: 1rem; color: var(--serene-primary); font-style: italic; margin-top: 6px; }
.ayah-ref { font-size: 0.85rem; color: var(--serene-on-surface-variant); margin-top: 4px; }
.ayah-row { width: 100%; margin-top: auto; padding-top: 20px; }
.rule-stack { }
.rule-card { padding: 20px 22px; border-radius: 16px; }
.card-title { font-weight: 700; color: var(--serene-on-surface); margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
.rule-text { font-size: 1rem; color: var(--serene-on-surface-variant); line-height: 1.7; }
.letter-chips { display: flex; flex-wrap: wrap; gap: 8px; }
.letter-chip { min-width: 40px; justify-content: center; font-weight: 700; border-radius: 10px; }
.attr-card { padding: 20px 22px; border-radius: 16px; }
.info-cards { }
.info-card { border-radius: 16px; padding: 14px 16px; display: flex; align-items: flex-start; gap: 12px; }
.ghunnah-card { background: #e6f4ea; }
.duration-card { background: #fff3e0; }
.info-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #006948; background: rgba(255,255,255,0.7); }
.info-name { font-weight: 700; color: var(--serene-on-surface); font-size: 0.9rem; }
.info-desc { font-size: 0.82rem; color: var(--serene-on-surface-variant); margin-top: 2px; line-height: 1.45; }
.pro-tip { background: #fff8e1; color: #6e5a00; padding: 12px 14px; border-radius: 12px; border-left: 4px solid #ffe082; font-size: 0.88rem; line-height: 1.5; }
.chat-cta { padding: 16px 20px; border-radius: 16px; }
.quiz-passed { display: inline-flex; align-items: center; color: var(--serene-secondary); font-weight: 600; font-size: 0.85rem; margin-top: 8px; }
.next-module-banner { background: var(--serene-secondary-container); border-radius: 16px; padding: 14px 18px; display: flex; align-items: center; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
@media (min-width: 600px) {
  .page-container { padding: 32px 24px 64px; }
  .lesson-card { padding: 36px 28px; min-height: 460px; }
}
@media (min-width: 1024px) {
  .page-container { padding: 40px 0 64px; }
  .lesson-card { padding: 44px 32px; min-height: 520px; border-radius: 28px; }
}
</style>
