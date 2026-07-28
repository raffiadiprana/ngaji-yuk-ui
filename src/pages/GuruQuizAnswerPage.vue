<template>
  <q-page class="guru-quiz-answer-page">
    <q-header elevated class="bg-green-gradient text-white serene-header">
      <q-toolbar>
        <q-btn flat round dense icon="arrow_back" @click="goBack" />
        <q-toolbar-title>{{ quiz?.module_detail.title || 'Quiz Detail' }}</q-toolbar-title>

        <q-btn
          flat
          dense
          round
          size="md"
          icon="more_vert"
          class="absolute-top-right q-mt-sm q-mr-sm"
        >
          <q-menu auto-close>
            <q-list style="min-width: 100px;">
              <q-item clickable @click="openConfirmDialog">
                <q-item-section>Tandai lulus</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>

    <div class="content-wrapper">
      <!-- Dialog Konfirmasi -->
      <q-dialog v-model="showConfirmDialog">
        <q-card class="serene-card">
          <q-card-section>
            <div class="text-h6">Konfirmasi</div>
            <div class="q-mt-sm text-serene-variant">Apakah Anda yakin ingin menandai quiz ini sebagai lulus?</div>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn flat label="Batal" @click="closeConfirmDialog" />
            <q-btn flat label="Ya" class="serene-btn-primary" @click="tandaiLulus" />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!-- Question -->
      <div class="q-mt-md">
        <div class="text-h6 q-mb-xs text-serene-on-surface">Question:</div>
        <q-card flat bordered class="q-pa-md serene-card">
          <div>
            {{ quiz?.question }}
          </div>
          <div v-if="quiz?.media_id != ''">
            <audio :src="getAudioUrl(quiz?.media_id)" controls v-if="quiz?.media_id" />
            <div v-else class="text-serene-variant">No audio available.</div>
          </div>
        </q-card>
      </div>

      <!-- Answer List -->
      <div class="q-mt-lg">
        <div class="text-h6 q-mb-sm text-serene-on-surface">Submitted Answers:</div>
        <div v-for="answer in answers" :key="answer.id" class="q-mb-sm">
          <q-chat-message
            :sent="answer.user_id === userId"
            :label="formatDate(answer.created_date)"
            :name="capitalize(answer.user_detail?.user_role || 'Unknown') + ' ' + (answer.user_detail?.display_name || 'Unknown')"
            :bg-color="answer.user_id === userId ? 'green-3' : 'grey-3'"
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
    </div>

    <!-- Input Answer -->
    <div class="fixed-bottom q-pa-sm bg-white" style="z-index: 100;padding-bottom: 70px;">
      <div class="row items-center no-wrap q-gutter-sm">
        <q-input
          filled
          dense
          v-model="answerInput"
          placeholder="Type your answer..."
          class="col"
          @keyup.enter="submitTextAnswer"
        />
        <q-btn flat round icon="send" @click="submitTextAnswer" :disable="!answerInput" />
        <q-btn flat round :icon="recording ? 'stop' : 'mic'" @click="toggleRecording" :loading="false" />
      </div>
      <q-banner v-if="recording" class="text-center text-grey q-mt-sm" dense>
        Recording... {{ recordingDuration }}s
      </q-banner>
    </div>

    <!-- Voice Guide Dialog -->
    <q-dialog v-model="showVoiceDialog" persistent>
      <q-card>
        <q-card-section>
          <div class="text-h6">Cara Menggunakan Voice Note</div>
          <div class="text-subtitle2 q-mt-sm">
            Tekan tombol <b>Stop</b> untuk menyelesaikan dan mengirim rekaman suara.
          </div>
        </q-card-section>
        <q-card-section>
          <q-checkbox v-model="dontShowAgain" label="Jangan tampilkan lagi" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="OK" color="primary" @click="closeVoiceDialog" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Unsupported Voice Recording Dialog -->
    <q-dialog v-model="showUnsupportedDialog">
      <q-card>
        <q-card-section>
          <div class="text-h6">Browser Tidak Didukung</div>
          <div class="text-subtitle2 q-mt-sm">
            Voice recording is not supported on this browser. Please use Google Chrome or another supported browser.
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="OK" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import api from 'src/config/api'
import { authHeader } from 'src/config/auth';

const route = useRoute();
const router = useRouter();

const accessToken = localStorage.getItem('token');
const userId = Number(localStorage.getItem('id'));
const quizId = Number(route.params.idquiz);
const santriId = Number(route.params.idsantri);

const quiz = ref(null);
const answers = ref([]);
const answerInput = ref('');
const recording = ref(false);
const recordingDuration = ref(0);
let mediaRecorder = null;
let timerInterval = null;
let chunks = ref([]);

// Dialogs
const showConfirmDialog = ref(false);  
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
  const instructorId = userId;
  const res = await axios.get(`${api.API_BASE_URL}/answers`, {
    headers: authHeader(),
    params: {
      quiz_id: quizId,
      'user_id[$in]': [santriId, instructorId],
      '$sort[created_date]': '1'
    }
  });
  answers.value = res.data?.data || [];
};

const updateCheckedBy = async () => {
  try {
    const instructorId = Number(localStorage.getItem('id')); // Get instructor ID from localStorage
    const userId = santriId; // Get student ID from route params

    // Filter answers that have no checked_by and need to be updated
    const answersToUpdate = answers.value.filter((answer) => {
      return answer.user_id === userId && !answer.checked_by; // Only update answers where `checked_by` is empty or null
    });

    // If there are no answers to update, return early
    if (answersToUpdate.length === 0) {
      console.log('No answers to update');
      return;
    }

    // Map over the answers that need updating and set `checked_by` to instructorId
    const updatedAnswers = answersToUpdate.map((answer) => ({
      checked_by: instructorId, // Only send `checked_by` to update
    }));

    // Send update requests to the server for the filtered answers (only send checked_by)
    const updatePromises = updatedAnswers.map((updatedAnswer, index) =>
      axios.patch(`${api.API_BASE_URL}/answers/${answersToUpdate[index].id}`, updatedAnswer, {
        headers: authHeader(),
      })
    );

    // Wait for all updates to finish
    await Promise.all(updatePromises);

    console.log('Answers updated successfully');
  } catch (error) {
    console.error('Failed to update checked_by:', error);
  }
};



const submitTextAnswer = async () => {
  const instructorId = Number(quiz.value?.module_detail?.instructor_id);
  if (!answerInput.value.trim()) return;

  try {
    await axios.post(`${api.API_BASE_URL}/answers`, {
      quiz_id: quizId,
      user_id: userId,
      instructor_id: instructorId,
      reply_to: santriId,
      answer_type: 'text',
      answer_value: answerInput.value.trim(),
      is_passed: 0,
      score: 0,
      review_notes: ""
    }, {
      headers: authHeader(),
    });

    answerInput.value = '';
  
    // Update checked_by after submit
    await updateCheckedBy();
    await fetchAnswers();

  } catch (err) {
    console.error('Submit text answer failed:', err);
  }
};

// Function to open the confirmation dialog
const openConfirmDialog = () => {
  showConfirmDialog.value = true;
};

// Function to close the confirmation dialog
const closeConfirmDialog = () => {
  showConfirmDialog.value = false;
};

const tandaiLulus= async () => {
  const instructorId = Number(quiz.value?.module_detail?.instructor_id);
  try {
    await axios.post(`${api.API_BASE_URL}/answers`, {
      quiz_id: quizId,
      user_id: userId,
      instructor_id: instructorId,
      reply_to: santriId,
      answer_type: 'text',
      answer_value: "Selamat anda telah lulus Quiz ini",
      is_passed: 1,
      score: 100,
      review_notes: ""
    }, {
      headers: authHeader(),
    });

    answerInput.value = '';
  
    // Update checked_by after submit
    await updateCheckedBy();
    await fetchAnswers();
    closeConfirmDialog(); // Close the dialog after submission
  } catch (err) {
    console.error('Submit text answer failed:', err);
  }
};

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
      reply_to: santriId,
      answer_type: 'file',
      answer_value: uploadedFilename,
      is_passed: 0,
      score: 0,
      review_notes: ""
    }, {
      headers: authHeader(),
    });
    await updateCheckedBy();
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

  setInterval(() => {
    if (quiz.value) {
      fetchAnswers()
    }
  }, 1000);
});
</script>

<style scoped>
.text-h6 {
  font-weight: bold;
}
.guru-quiz-answer-page {
  min-height: 100vh;
  background: var(--serene-bg);
  position: relative;
}

.content-wrapper {
  position: relative;
  z-index: 1;
  padding: 0 16px;
}

.q-page {
  padding-bottom: 100px;
}
</style>
