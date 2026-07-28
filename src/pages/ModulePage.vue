<template>
  <q-page class="module-page">
    <div class="page-container">
      <!-- Top header -->
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

      <div class="lesson-layout row q-col-gutter-md">
        <!-- Center: lesson card -->
        <div class="col-12 col-md-7">
          <div class="lesson-card">
            <div class="example-chip">Contoh 01</div>
            <div class="arabic-display arabic-font" dir="rtl">{{ displayArabic || 'مِنْ بَعْدِ' }}</div>
            <div class="transliteration">{{ displayTransliteration || 'Min Ba’di' }}</div>
            <q-btn outline color="serene-primary" icon="volume_up" label="Dengarkan Aturan" class="listen-btn q-mt-md" @click="playAudio" />
            <div class="diagram q-mt-lg">
              <div class="diagram-col">
                <div class="diagram-line line-nun"></div>
                <div class="diagram-label">NUN SUKUN</div>
              </div>
              <div class="diagram-col">
                <div class="diagram-line line-ya"></div>
                <div class="diagram-label">{{ ruleLettersLabel }}</div>
              </div>
            </div>
          </div>

          <!-- Chat CTA + next -->
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

        <!-- Right sidebar -->
        <div class="col-12 col-md-5">
          <div class="rule-stack">
            <q-card class="rule-card serene-card">
              <div class="card-title"><q-icon name="menu_book" color="serene-primary" size="sm" class="q-mr-sm" />The Rule</div>
              <div class="rule-text">{{ moduleData?.description || 'Belum ada penjelasan untuk modul ini.' }}</div>
              <div v-if="ruleLetters.length" class="letter-chips q-mt-sm">
                <q-chip v-for="ch in ruleLetters" :key="ch" dense outline color="serene-primary" text-color="serene-primary" class="letter-chip">{{ ch }}</q-chip>
              </div>
            </q-card>

            <q-card class="attr-card serene-card q-mt-md">
              <div class="card-title"><q-icon name="tune" color="serene-primary" size="sm" class="q-mr-sm" />Attributes</div>
              <div class="attr-row">
                <div>
                  <div class="attr-name">Nasal Sound (Ghunnah)</div>
                  <div class="attr-desc">{{ ghunnahLabel }}</div>
                </div>
                <q-toggle :model-value="!!moduleData?.ghunnah" color="serene-primary" class="q-ml-auto" disable />
              </div>
              <div class="attr-row q-mt-sm">
                <div>
                  <div class="attr-name">Duration / Beats</div>
                  <div class="attr-desc">{{ moduleData?.duration || 2 }} Beats</div>
                </div>
                <q-slider :model-value="moduleData?.duration || 2" :min="1" :max="6" color="serene-primary" class="q-ml-md" disable style="width:140px" />
              </div>
              <q-separator class="q-my-md" />
              <div class="pro-tip text-caption text-serene-variant"><b>Pro tip:</b> Coba tahan napas sedikit saat menghafal aturan ini; konsistensi lebih penting dari kecepatan.</div>
            </q-card>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, nextTick } from 'vue';
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

const moduleData = ref(null);
const quizes = ref([]);
const isPassed = ref(false);
const sectionName = ref('');
const startingChat = ref(false);
const nextModuleId = ref(null);

const accessToken = localStorage.getItem('token');
const userId = Number(localStorage.getItem('id'));

const currentOrder = computed(() => {
  const cats = ['core','advanced','reference'];
  const sameCat = (moduleData.value?.category || 'core');
  // crude: show overall position based on order_index when available
  return moduleData.value?.order_index || '—';
});
const totalCount = computed(() => 0); // optional, or fetch total
const progressPercent = computed(() => moduleData.value?.progress_percent || 0);

const displayArabic = computed(() => moduleData.value?.arabic_text || '');
const displayTransliteration = computed(() => moduleData.value?.transliteration || '');
const ruleLetters = computed(() => {
  // stub: extract example letters if needed from description/arabic
  return [];
});
const ruleLettersLabel = computed(() => ruleLetters.value.join(' ') || '—');
const ghunnahLabel = computed(() => (moduleData.value?.ghunnah ? 'Aktif (dengung hidung)' : 'Tidak aktif'));

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

const playAudio = () => {
  // Play a simple tone via Web Audio API / browser speech for now
  try {
    const Speech = window.SpeechSynthesisUtterance || window.speechSynthesis;
    if (!Speech) return;
    const u = new SpeechSynthesisUtterance(displayTransliteration.value || '');
    u.lang = 'en-US';
    u.rate = 0.8;
    window.speechSynthesis?.speak(u);
  } catch (e) { console.error(e); }
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
  } catch (error) {
    console.error('Failed to fetch data:', error);
  }
});
</script>

<style scoped>
.module-page { min-height: 100vh; background: var(--serene-bg); }
.page-container { max-width: 1200px; margin: 0 auto; padding: 24px 16px 48px; }
.lesson-header { background: #fff; border-radius: 16px; padding: 16px 20px; border: 1px solid var(--serene-border); }
.progress-track { height: 8px; background: var(--serene-surface-container-low); border-radius: 999px; overflow: hidden; }
.progress-fill { height: 100%; background: var(--serene-primary); border-radius: 999px; transition: width .3s ease; }

.lesson-layout { margin-top: 20px; }
.lesson-card { background: #e6f4ea; border-radius: 24px; padding: 32px 24px; text-align: center; position: relative; overflow: hidden; min-height: 420px; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.example-chip { position: absolute; top: 16px; left: 16px; background: var(--serene-primary); color: #fff; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 600; }
.arabic-display { font-size: 3rem; color: var(--serene-on-surface); line-height: 1.4; margin-top: 16px; font-family: 'Noto Serif', serif; }
.transliteration { font-size: 1.1rem; color: var(--serene-primary); font-weight: 600; margin-top: 10px; font-style: italic; }
.listen-btn { border-radius: 999px; padding: 10px 18px; font-weight: 600; }

.diagram { display: flex; gap: 24px; margin-top: auto; padding-top: 24px; }
.diagram-col { display: flex; flex-direction: column; align-items: center; gap: 8px; }
.diagram-line { width: 6px; height: 80px; border-radius: 999px; }
.line-nun { background: #006948; }
.line-ya { background: #fe932c; }
.diagram-label { font-size: 12px; font-weight: 700; letter-spacing: 0.08em; color: var(--serene-on-surface-variant); }

.rule-stack { }
.rule-card { padding: 20px 22px; border-radius: 16px; }
.card-title { font-weight: 700; color: var(--serene-on-surface); margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
.rule-text { font-size: 1rem; color: var(--serene-on-surface-variant); line-height: 1.7; }
.letter-chips { display: flex; flex-wrap: wrap; gap: 8px; }
.letter-chip { min-width: 40px; justify-content: center; font-weight: 700; border-radius: 10px; }

.attr-card { padding: 20px 22px; border-radius: 16px; }
.attr-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.attr-name { font-weight: 600; color: var(--serene-on-surface); }
.attr-desc { font-size: 0.85rem; color: var(--serene-variant); margin-top: 2px; }
.pro-tip { background: #fff8e1; color: #6e5a00; padding: 12px 14px; border-radius: 12px; border: 1px solid #ffe082; }

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
