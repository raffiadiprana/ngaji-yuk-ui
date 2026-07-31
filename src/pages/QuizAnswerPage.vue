<template>
  <q-page class="quiz-answer-page">

    <q-header elevated class="serene-header">
      <q-toolbar>
        <q-btn flat round dense icon="arrow_back" @click="goBack" />
        <q-toolbar-title>{{ quiz?.module_detail.title || 'Quiz Detail' }}</q-toolbar-title>
      </q-toolbar>
    </q-header>

    <div class="content-wrapper">
      <!-- Question -->
      <div class="q-mt-md">
        <div class="text-h6 q-mb-xs text-serene-on-surface">Question:</div>
        <q-card flat bordered class="q-pa-md serene-card">
          <div>
            {{ quiz?.question }}
          </div>
          <div v-if="quiz?.media_id != ''">
            <audio class="full-width" :src="getAudioUrl(quiz?.media_id)" controls v-if="quiz?.media_id" />
            <div v-else class="text-grey">No audio available.</div>
          </div>
        </q-card>

        <q-banner v-if="quiz?.instructor_detail?.display_name" class="serene-assign-banner q-mt-sm" dense>
          <template v-slot:avatar>
            <q-icon name="supervisor_account" color="serene-primary" />
          </template>
          Menunggu balasan dari <b>{{ quiz.instructor_detail.display_name }}</b>
        </q-banner>
      </div>

      <!-- Answer List -->
      <div class="q-mt-lg">
        <div class="text-h6 q-mb-sm text-serene-on-surface">Percakapan:</div>
        <div v-for="answer in answers" :key="answer.id" class="q-mb-sm">
          <q-chat-message
            :sent="answer.user_id === userId"
            :label="formatDate(answer.created_date)"
            :name="capitalize(answer.user_detail?.user_role || 'Unknown') + ' ' + (answer.user_detail?.display_name || 'Unknown')"
            :bg-color="answer.user_id === userId ? 'serene-sent' : 'serene-recv'"
            text-color="black"
          >
            <template v-slot:default>
              <div v-if="answer.answer_type == 'text'">
                {{ answer?.answer_value }}
              </div>
              <div v-if="answer.answer_type == 'file'">
                <audio :src="getAudioUrl(answer?.answer_value)" controls class="col-2" />
              </div>
            </template>
          </q-chat-message>
        </div>
      </div>

      <!-- Tombol Materi Selanjutnya (muncul hanya kalau lulus guru) -->
      <div v-if="isPassedByGuru" class="next-module-banner q-mt-md">
        <q-icon name="verified" color="serene-secondary" size="sm" class="q-mr-xs" />
        <span class="text-weight-bold text-serene-secondary">Selamat, materi ini telah lulus!</span>
        <q-btn
          v-if="nextModuleId"
          label="Materi Selanjutnya"
          icon-right="arrow_forward"
          class="serene-btn-primary q-ml-md"
          @click="goToNextModule"
        />
        <q-btn v-else label="Kembali ke Kurikulum" icon-right="arrow_forward" class="serene-btn-primary q-ml-md" @click="router.push('/tajwid')" />
      </div>

      <!-- Input Answer -->
      <div class="fixed-bottom q-pa-sm serene-input-bar" style="z-index: 100;padding-bottom: 70px;">
        <div class="chat-input-container row items-center no-wrap q-gutter-sm">
          <q-input
            filled
            dense
            v-model="answerInput"
            placeholder="Ketik pesan..."
            class="col serene-input"
            @keyup.enter="submitTextAnswer"
          />
          <q-btn flat round icon="send" class="serene-send-btn" @click="submitTextAnswer" :disable="!answerInput" />
          <q-btn flat round :icon="recording ? 'stop' : 'mic'" class="serene-send-btn" @click="toggleRecording" :loading="false" />
        </div>
        <q-banner v-if="recording" class="text-center text-serene-variant q-mt-sm" dense>
          Merekam... {{ recordingDuration }}s
        </q-banner>
      </div>

      <!-- Voice Guide Dialog -->
      <q-dialog v-model="showVoiceDialog" persistent>
        <q-card class="serene-card">
          <q-card-section>
            <div class="text-h6">Cara Menggunakan Voice Note</div>
            <div class="text-subtitle2 q-mt-sm text-serene-variant">
              Tekan tombol <b>Stop</b> untuk menyelesaikan dan mengirim rekaman suara.
            </div>
          </q-card-section>
          <q-card-section>
            <q-checkbox v-model="dontShowAgain" label="Jangan tampilkan lagi" />
          </q-card-section>
          <q-card-actions align="right">
            <q-btn flat label="OK" class="serene-btn-primary" @click="closeVoiceDialog" />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!-- Unsupported Voice Recording Dialog -->
      <q-dialog v-model="showUnsupportedDialog">
        <q-card class="serene-card">
          <q-card-section>
            <div class="text-h6">Browser Tidak Didukung</div>
            <div class="text-subtitle2 q-mt-sm text-serene-variant">
              Voice recording is not supported on this browser. Please use Google Chrome or another supported browser.
            </div>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn flat label="OK" class="serene-btn-primary" v-close-popup />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import api from 'src/config/api'
import { authHeader } from 'src/config/auth';

const route = useRoute();
const router = useRouter();

const accessToken = localStorage.getItem('token');
const userId = Number(localStorage.getItem('id'));
const quizId = Number(route.params.id);

const quiz = ref(null);
const answers = ref([]);
const answerInput = ref('');
const recording = ref(false);
const recordingDuration = ref(0);
let mediaRecorder = null;
let timerInterval = null;
let chunks = ref([]);

// Next module (muncul kalau lulus guru)
const nextModuleId = ref(null);
const isPassedByGuru = computed(() => quiz.value?.is_completed === 1);
const goToNextModule = () => {
  if (nextModuleId.value) router.push(`/module/${nextModuleId.value}`);
  else router.push('/tajwid');
};
const fetchNextModule = async () => {
  const cur = quiz.value?.module_detail;
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

// Dialogs
const showVoiceDialog = ref(false);
const dontShowAgain = ref(false);
const showUnsupportedDialog = ref(false);

const checkVoiceGuide = () => {
  const dismissed = localStorage.getItem('voiceGuideDismissed');
  if (!dismissed) {
    showVoiceDialog.value = true;
    return false;
  }
  return true;
};

const closeVoiceDialog = () => {
  if (dontShowAgain.value) {
    localStorage.setItem('voiceGuideDismissed', 'true');
  }
  showVoiceDialog.value = false;
  startRecording();
};

const goBack = () => router.go(-1);
const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : '';
const formatDate = (str) => new Date(str).toLocaleString();
const getAudioUrl = (filename) => filename ? `${api.API_BASE_URL}/uploads/${filename}` : '';

const fetchAnswers = async () => {
  const instructorId = Number(quiz.value?.module_detail?.instructor_id);
  const userIds = [userId];
  if (Number.isFinite(instructorId)) userIds.push(instructorId)
  const res = await axios.get(`${api.API_BASE_URL}/answers`, {
    headers: authHeader(),
    params: {
      quiz_id: quizId,
      'user_id[$in]': userIds,
      '$sort[created_date]': '1'
    }
  });
  answers.value = res.data?.data || [];
};

const submitTextAnswer = async () => {
  const payload = {
    quiz_id: quizId,
    user_id: userId,
    instructor_id: instructorId,
    answer_type: 'text',
    answer_value: answerInput.value.trim(),
    is_passed: 0,
    score: 0,
    review_notes: ''
  }
  if (!payload.answer_value) return;
  try {
    const base = (api.API_BASE_URL || '').replace(/\/$/, '');
    await axios.post(`${base}/answers`, payload, {
      headers: {
        ...authHeader(),
        'Content-Type': 'application/json'
      }
    })
    answerInput.value = ''
    await fetchAnswers()
  } catch (err) {
    const data = err?.response?.data
    const msg = data?.message || err.message || 'Gagal mengirim jawaban'
    alert(msg)
    console.error('Submit text answer failed:', err.response?.data || err)
  }
}

const startTimer = () => {
  recordingDuration.value = 0;
  timerInterval = setInterval(() => {
    recordingDuration.value += 1;
  }, 1000);
};

const stopTimer = () => {
  clearInterval(timerInterval);
  timerInterval = null;
};

const toggleRecording = async () => {
  if (recording.value) {
    mediaRecorder?.stop();
    recording.value = false;
    stopTimer();
  } else {
    const allowed = checkVoiceGuide();
    if (allowed) {
      startRecording();
    }
  }
};

const startRecording = async () => {
  if (typeof MediaRecorder === 'undefined') {
    showUnsupportedDialog.value = true;
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    chunks.value = [];
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.value.push(e.data);
    };
    mediaRecorder.onstop = handleRecordingStop;
    mediaRecorder.start();
    recording.value = true;
    startTimer();
  } catch (err) {
    console.error('Mic permission error:', err);
  }
};

const handleRecordingStop = async () => {
  const blob = new Blob(chunks.value, { type: 'audio/mp3' });
  const filename = `audio_${userId}_${Date.now()}.mp3`;
  const file = new File([blob], filename, { type: 'audio/mp3' });
  const formData = new FormData();
  formData.append('file', file);

  try {
    const uploadRes = await fetch(`${api.API_BASE_URL}/uploads`, {
      method: "POST",
      headers: { ...authHeader(),},
      body: formData
    });
    const upload = await uploadRes.json();
    const uploadedFilename = upload?.filename || filename;
    const instructorId = Number(quiz.value?.module_detail?.instructor_id);

    await axios.post(`${api.API_BASE_URL}/answers`, {
      quiz_id: quizId,
      user_id: userId,
      instructor_id: instructorId,
      reply_to: instructorId,
      answer_type: 'file',
      answer_value: uploadedFilename,
      is_passed: 0,
      score: 0,
      review_notes: ""
    }, {
      headers: authHeader(),
    });
    // Refresh percakapan
    await fetchAnswers();
  } catch (err) {
    console.error("Upload or answer submit failed:", err);
  }
};

onMounted(async () => {
  const quizRes = await axios.get(`${api.API_BASE_URL}/quiz?id=${quizId}`, {
    headers: authHeader(),
  });
  quiz.value = quizRes.data?.data?.[0] || null;
  await fetchAnswers();
  if (isPassedByGuru.value) await fetchNextModule();

  setInterval(async () => {
    if (quiz.value) {
     await fetchAnswers();
    }
  }, 3000)
});
</script>

<style scoped>
.quiz-answer-page {
  min-height: 100vh;
  background: var(--serene-bg);
  position: relative;
}

.content-wrapper {
  position: relative;
  z-index: 1;
  padding: 0 16px;
}

.serene-input-bar {
  background: var(--serene-surface);
  border-top: 1px solid var(--serene-border);
}

.next-module-banner {
  background: var(--serene-secondary-container);
  border-radius: 16px;
  padding: 14px 18px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.chat-input-container {
  max-width: 800px;
  margin: 0 auto;
}

.serene-input .q-field__control {
  background: var(--serene-bg);
  border-radius: 9999px;
}

.serene-assign-banner {
  background: var(--serene-primary-container);
  color: var(--serene-on-primary-container);
  border-radius: var(--serene-radius);
}

.text-h6 {
  font-weight: bold;
}

/* default untuk mobile */
.q-page {
  padding-bottom: 70px;
}
.input-container {
  padding-bottom: 70px;
}

/* untuk laptop (>= 1024px) */
@media screen and (min-width: 1024px) {
  .q-page {
    padding-bottom: 100px;
  }
  .input-container {
    padding-bottom: 100px;
  }
}
</style>
