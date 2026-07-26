<template>
  <q-page class="q-pa-md">
    <q-header elevated class="bg-green-gradient text-white">
      <q-toolbar>
        <q-btn flat round dense icon="arrow_back" @click="goBack" />
        <q-toolbar-title>{{ lessons?.title || 'Lesson' }}</q-toolbar-title>
      </q-toolbar>
    </q-header>

    <!-- Video Player -->
    <div v-if="videoReady" class="video-container q-mt-md">
      <video
        ref="videoPlayer"
        class="video-js vjs-default-skin vjs-big-play-centered"
        playsinline
        allowfullscreen
      ></video>
    </div>

    <!-- Instructor Profile -->
    <div class="instructor-section q-mt-xl">
      <q-avatar size="56px">
        <img :src="lessons?.module_detail?.instructor_profile?.avatar ? api.API_UPLOADS_URL + '/' +lessons?.module_detail?.instructor_profile?.avatar : 'https://placehold.co/100'" />
      </q-avatar>
      <div class="q-ml-md">
        <div class="text-bold text-dark">
          {{ lessons?.module_detail?.instructor_profile?.display_name || '' }}
        </div>
        <div class="text-caption text-grey-7">
          {{ lessons?.module_detail?.instructor_profile?.jobtitle || '' }}
        </div>
      </div>
    </div>

    <!-- Description -->
    <div class="description-section q-mt-xl">
      {{ lessons?.description || '' }}
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import axios from 'axios';
import api from 'src/config/api'
import { authHeader } from 'src/config/auth';

import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import 'videojs-youtube';

const router = useRouter();
const route = useRoute();
const lessonId = route.params.id;
const accessToken = localStorage.getItem('token');
const userId = Number(localStorage.getItem('id'));

const lessons = ref(null);
const videoPlayer = ref(null);
const videoReady = ref(false);
let player = null;
let interval = null;
let lastPositionFromLog = 0;
const maxWatchedTime = ref(0);

const lastLogData = ref({
  parent_id: Number(lessonId),
  user_id: userId,
  last_position: 0,
  duration: 0,
  is_complete: 0,
  updated_date: new Date().toISOString()
});

const goBack = () => router.go(-1);
const isEnded = ref(false);

onMounted(async () => {
  await fetchPreviousLog();
  await fetchLessonAndInit();
});

async function fetchPreviousLog() {
  try {
    const res = await axios.get(`${api.API_BASE_URL}/videologs`, {
      headers: authHeader(),
      params: { user_id: userId, parent_id: lessonId }
    });
    const log = res.data?.data?.[0];
    if (log?.last_position) {
      lastPositionFromLog = log.last_position;
    }
  } catch (err) {
    console.warn('No previous log found or failed to fetch');
  }
}

async function fetchLessonAndInit() {
  try {
    const res = await axios.get(`${api.API_BASE_URL}/lessons?id=${lessonId}`, {
      headers: authHeader(),
    });
    const { data: lessonsDataArray } = res.data;
    lessons.value = lessonsDataArray[0] || null;

    if (lessons.value?.video_header_id) {
      const raw = lessons.value.video_header_id;
      const match = raw.match(/(?:youtu\.be\/|v=)([^&]+)/);
      const videoId = match?.[1];

      if (videoId) {
        videoReady.value = true;
        await nextTick();
        initVideoJs(videoId);
      }
    }
  } catch (err) {
    console.error('Failed to fetch lesson data', err);
  }
}

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
    youtube: { modestbranding: 1, rel: 0, showinfo: 0 },
    responsive: true,
    fluid: true
  });

  player.on('loadedmetadata', () => {
    if (lastPositionFromLog > 0 && lastPositionFromLog < player.duration()) {
      player.currentTime(lastPositionFromLog);
      maxWatchedTime.value = lastPositionFromLog;
    }
  });

  player.on('play', () => {
    if (interval) clearInterval(interval);
    interval = setInterval(() => sendVideoLog(), 30000);
  });

  player.on('timeupdate', () => {
    const current = player.currentTime();
    const total = player.duration();

    if (current - maxWatchedTime.value > 5) {
      player.currentTime(maxWatchedTime.value);
      return;
    }

    if (current > maxWatchedTime.value) {
      maxWatchedTime.value = current;
    }

    lastLogData.value.last_position = Math.floor(current);
    lastLogData.value.duration = Math.floor(total);
    lastLogData.value.updated_date = new Date().toISOString();
    lastLogData.value.is_complete = 0;
  });

  player.on('pause', () => {
    clearInterval(interval);
    sendVideoLog();
  });

  player.on('ended', () => {
    clearInterval(interval);
    isEnded.value = true;
    lastLogData.value.is_complete = 1;
    sendVideoLog(true);
  });

}

async function sendVideoLog(is_ended = false) {
  // Periksa apakah sudah selesai
  if (is_ended) {
    lastLogData.value.is_complete = 1;
  } else {
    lastLogData.value.is_complete = 0;
  }

  const { user_id, parent_id } = lastLogData.value;

  try {
    const res = await axios.get(`${api.API_BASE_URL}/videologs`, {
      headers: authHeader(),
      params: { user_id, parent_id }
    });
    const existing = res.data?.data?.[0];
    const payload = { ...lastLogData.value };

    if (existing) {
      await axios.patch(`${api.API_BASE_URL}/videologs/${existing.id}`, payload, {
        headers: authHeader(),
      });
    } else {
      await axios.post(`${api.API_BASE_URL}/videologs`, payload, {
        headers: authHeader(),
      });
    }
  } catch (err) {
    console.error('Failed to send video log:', err);
  }
}
onBeforeUnmount(() => {
  clearInterval(interval);
  if(!isEnded.value){
    sendVideoLog(); // kirim dengan status akhir
  }
  if (player) {
    player.dispose();
    player = null;
  }
});
</script>

<style scoped>
/* Layout Utama */
.page-container {
  max-width: 1200px;
  margin: 0 auto;
}

.content-wrapper {
  padding: 0 16px;
}

/* Video Container */
.video-container {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  margin-bottom: 24px;
}

.video-js {
  width: 100%;
  height: 0;
  padding-bottom: 56.25%; /* 16:9 Aspect Ratio */
  border-radius: 8px;
}

/* Instructor Section */
.instructor-section {
  display: flex;
  align-items: center;
  max-width: 800px;
  margin: 0 auto;
  padding: 0 8px;
}

.instructor-info {
  margin-left: 16px;
}

/* Description Section */
.description-section {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 8px;
  line-height: 1.6;
}

/* Responsive Breakpoints */
@media (min-width: 600px) {
  .content-wrapper {
    padding: 0 24px;
  }
  
  .video-js {
    height: 450px;
    padding-bottom: 0;
  }
}

@media (min-width: 1024px) {
  .content-wrapper {
    padding: 0;
  }
  
  .instructor-section,
  .description-section {
    padding: 0;
  }
}

</style>
