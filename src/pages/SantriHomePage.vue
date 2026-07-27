<template>
  <div class="santri-home">
    <!-- Welcome + Streak -->
    <section class="home-header row items-end justify-between q-mb-lg wrap">
      <div class="fade-in-up">
        <h2 class="headline-font home-greeting">Assalamu'alaikum, {{ shortName() }}</h2>
        <p class="home-sub">Semoga harimu penuh berkah dalam mempelajari Al-Qur'an.</p>
      </div>
      <div class="serene-card-soft streak-chip row items-center q-px-md q-py-sm">
        <q-icon name="local_fire_department" color="serene-secondary" size="28px" />
        <div class="q-ml-sm">
          <div class="text-caption text-serene-variant text-uppercase" style="font-size:10px;letter-spacing:1px;">Daily Streak</div>
          <div class="headline-font text-h6 text-serene-secondary leading-none">{{ streak }} Hari</div>
        </div>
      </div>
    </section>

    <!-- Top Grid: Progress + Lanjutkan Belajar -->
    <section class="grid q-col-gutter-md q-mb-md santri-grid-3">
      <!-- Progress Card -->
      <div class="col-12 col-md-8">
        <div class="serene-card-soft p-lg relative-position overflow-hidden flex column justify-between home-progress">
          <div class="relative-position" style="z-index:1">
            <q-chip class="serene-chip" color="serene-primary-container" text-color="serene-on-primary-container" size="sm">
              Sedang Dipelajari
            </q-chip>
            <h3 class="headline-font text-h6 text-serene-on-surface q-mt-sm q-mb-md">{{ activeLesson }}</h3>
            <div class="row items-center justify-between q-mb-xs">
              <span class="text-body2 text-serene-variant">Total Progress</span>
              <span class="text-weight-bold text-serene-primary">{{ progress }}%</span>
            </div>
            <q-linear-progress
              :value="progress / 100"
              color="serene-primary"
              class="progress-glow rounded-borders"
              style="height:10px;"
            />
            <div class="row q-gutter-md q-pt-md">
              <div class="row items-center text-serene-variant text-caption">
                <q-icon name="check_circle" color="serene-primary" size="sm" class="q-mr-xs" />
                <span>{{ doneCount }} Materi Selesai</span>
              </div>
              <div class="row items-center text-serene-variant text-caption">
                <q-icon name="schedule" color="serene-outline" size="sm" class="q-mr-xs" />
                <span>{{ remainCount }} Materi Tersisa</span>
              </div>
            </div>
          </div>
          <div class="home-progress-deco" />
        </div>
      </div>

      <!-- Lanjutkan Belajar -->
      <div class="col-12 col-md-4">
        <div class="serene-card p-lg relative-position overflow-hidden flex column justify-between text-white home-continue">
          <div class="relative-position" style="z-index:1">
            <p class="text-white text-caption text-uppercase" style="opacity:.8;letter-spacing:1px;">Lanjutkan Belajar</p>
            <h3 class="headline-font text-h6 q-mb-xs">{{ continueLesson }}</h3>
            <p class="text-body2" style="opacity:.85;">{{ continueDesc }}</p>
            <div class="serene-card-soft q-pa-sm q-mt-md rounded-borders">
              <p class="arabic-font text-center text-h6 q-my-none">{{ continueArabic }}</p>
            </div>
          </div>
          <q-btn
            unelevated
            class="serene-btn-light q-mt-md full-width"
            label="Lanjut Sekarang"
            icon-right="arrow_forward"
            @click="goContinue"
          />
          <div class="home-continue-deco" />
        </div>
      </div>
    </section>

    <!-- Quick Actions -->
    <section class="grid q-col-gutter-md q-mb-md santri-grid-4">
      <div v-for="qa in quickActions" :key="qa.label" class="col-6 col-md-3">
        <button class="serene-card quick-action text-left interactive" @click="qa.action ? qa.action() : null">
          <div class="quick-icon" :class="qa.colorClass">
            <q-icon :name="qa.icon" size="24px" />
          </div>
          <div class="text-weight-bold text-serene-on-surface q-mt-sm">{{ qa.label }}</div>
          <div class="text-caption text-serene-variant">{{ qa.desc }}</div>
        </button>
      </div>
    </section>

    <!-- Bottom: Saran Pelajaran + Achievement + Ayat Harian -->
    <section class="grid q-col-gutter-md santri-grid-2">
      <!-- Saran Pelajaran -->
      <div class="col-12 col-md-7">
        <div class="serene-card-soft p-md">
          <div class="row items-center justify-between q-mb-md">
            <h4 class="headline-font text-h6 q-my-none">Saran Pelajaran</h4>
            <q-btn flat dense color="serene-primary" label="Lihat Semua" />
          </div>
          <div v-if="courses.length" class="column q-gutter-sm">
            <div
              v-for="c in courses.slice(0, 4)"
              :key="c.id"
              class="row items-center q-pa-sm hover-lift rounded-borders cursor-pointer"
              @click="$router.push(`/module/${c.id}`)"
            >
              <q-avatar size="44px" class="bg-serene-surface text-serene-primary flex flex-center">
                <q-icon name="music_note" />
              </q-avatar>
              <div class="col q-ml-md">
                <div class="text-weight-bold text-serene-on-surface">{{ c.title }}</div>
                <div class="text-caption text-serene-variant">Pelajari hukum tajwid ini</div>
              </div>
              <q-icon name="chevron_right" color="serene-outline-variant" />
            </div>
          </div>
          <div v-else class="text-caption text-serene-variant">Belum ada saran pelajaran.</div>
        </div>
      </div>

      <!-- Ayat Harian + Achievement -->
      <div class="col-12 col-md-5 column q-gutter-md">
        <!-- Ayat Harian -->
        <div class="serene-card p-md relative-position overflow-hidden">
          <div class="text-caption text-serene-variant q-mb-xs">Ayat Harian</div>
          <p class="arabic-font text-h5 text-center text-serene-primary q-my-md" dir="rtl">{{ dailyVerse.arabic }}</p>
          <div class="text-center">
            <p class="text-body2 text-serene-variant italic">"{{ dailyVerse.translation }}"</p>
            <p class="text-caption text-serene-outline q-mt-xs">— {{ dailyVerse.source }}</p>
          </div>
        </div>
        <!-- Achievement -->
        <div class="serene-card p-md text-center">
          <q-icon name="workspace_premium" color="serene-secondary" size="40px" class="badge-glow rounded-borders" />
          <div class="headline-font text-h6 text-serene-on-surface q-mt-xs">Scholar of the Month</div>
          <p class="text-body2 text-serene-variant">Kamu masuk dalam 5% teratas bulan ini!</p>
          <q-btn unelevated class="serene-btn-primary q-mt-sm" label="Klaim Reward" />
        </div>
      </div>
    </section>

    <!-- List Hukum Tajwid (tetap ada, di bawah) -->
    <section class="tajwid-section q-mt-lg">
      <div class="section-header q-mb-md">
        <h5 class="headline-font section-title text-serene-on-surface">List Hukum Tajwid</h5>
      </div>
      <q-input
        v-model="searchText"
        rounded
        outlined
        dense
        placeholder="Cari Tajwid..."
        debounce="300"
        @keyup.enter="fetchSections"
        class="search-bar serene-pill-input"
        bg-color="white"
      >
        <template v-slot:prepend>
          <q-icon name="search" color="serene-primary" />
        </template>
        <template v-slot:append>
          <q-btn v-if="searchText" flat dense round icon="clear" color="grey" @click="() => { searchText=''; fetchSections(); }" />
        </template>
      </q-input>

      <q-list class="section-list">
        <q-expansion-item
          v-for="section in sections"
          :key="section.id"
          expand-separator
          dense
          class="section-item serene-card q-mb-sm"
          header-class="section-header-item"
          @show="fetchModules(section.id)"
        >
          <template v-slot:header>
            <div class="section-header-content">
              <q-icon name="menu_book" color="serene-primary" size="sm" class="q-mr-sm" />
              <div class="text-subtitle1 section-name text-serene-on-surface">{{ section.section_name }}</div>
              <q-space />
              <q-icon name="expand_more" />
            </div>
          </template>
          <q-list class="module-list">
            <q-item v-if="!modulesMap[section.id]" class="loading-item">
              <q-item-section><q-skeleton type="text" width="80%" /></q-item-section>
            </q-item>
            <q-item
              v-for="module in modulesMap[section.id]"
              :key="module.id"
              clickable
              @click="$router.push(`/module/${module.id}`)"
              class="module-item"
            >
              <q-item-section avatar><q-icon name="play_circle" color="serene-primary" /></q-item-section>
              <q-item-section><q-item-label class="module-title text-serene-on-surface">{{ module.title }}</q-item-label></q-item-section>
              <q-item-section side><q-icon name="chevron_right" color="serene-outline-variant" /></q-item-section>
            </q-item>
          </q-list>
        </q-expansion-item>
      </q-list>
    </section>
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
const displayName = ref(localStorage.getItem('displayName') || localStorage.getItem('email') || 'Santri');
// Untuk mobile: jika displayName berupa email, ambil bagian sebelum '@'
const shortName = () => {
  const raw = displayName.value || '';
  if (raw.includes('@')) return raw.split('@')[0];
  return raw;
};

// Statis sementara (backend streak menyusul)
const streak = ref(5);
const activeLesson = ref('Hukum Nun Sukun & Tanwin');
const progress = ref(70);
const doneCount = ref(3);
const remainCount = ref(2);
const continueLesson = ref('Idgham Bighunnah');
const continueDesc = ref('Pelajari cara meleburkan suara nun mati ke dalam huruf Ya, Nun, Mim, atau Wau.');
const continueArabic = ref('مَن يَقُولُ');
const continueModuleId = ref(null);

// Ayat Harian (statis, bisa diacak per hari)
const dailyVerses = [
  { arabic: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا', translation: 'For indeed, with hardship [will be] ease.', source: 'Surah Ash-Sharh [94:5]' },
  { arabic: 'وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا', translation: 'And recite the Quran with measured recitation.', source: 'Surah Al-Muzzammil [73:4]' },
  { arabic: 'إِنَّ اللَّهَ مَعَ الصَّابِرِينَ', translation: 'Indeed, Allah is with the patient.', source: 'Surah Al-Baqarah [2:153]' }
];
const dailyVerse = ref(dailyVerses[new Date().getDate() % dailyVerses.length]);

const quickActions = [
  { label: 'Uji Pendengaran', desc: 'Latih telinga mengenali tajwid.', icon: 'hearing', colorClass: 'qa-primary', action: () => $router.push('/quiz') }
];

const goContinue = () => {
  if (continueModuleId.value) $router.push(`/lesson/${continueModuleId.value}`);
  else $router.push('/tajwid');
};

const fetchSections = async () => {
  try {
    const params = {};
    if (searchText.value.trim()) params['section_name[$like]'] = `%${String(searchText.value.trim())}%`;
    const sectionsRes = await axios.get(`${api.API_BASE_URL}/sections`, { headers: authHeader(), params });
    sections.value = sectionsRes.data.data || [];
  } catch (e) {
    console.error('Failed to fetch sections:', e);
    sections.value = [];
  }
};

const fetchModules = async (sectionId) => {
  if (modulesMap.value[sectionId]) return;
  try {
    const res = await axios.get(`${api.API_BASE_URL}/modules`, {
      headers: authHeader(),
      params: { section_id: sectionId }
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
    try { profile.value = JSON.parse(profileData); } catch (e) { console.error(e); }
  }

  await fetchSections();

  const [modulesResult, logsResult] = await Promise.allSettled([
    axios.get(`${api.API_BASE_URL}/modules`, { headers: authHeader() }),
    axios.get(`${api.API_BASE_URL}/videologs`, { headers: authHeader(), params: { user_id: userId } })
  ]);

  if (modulesResult.status === 'fulfilled') {
    courses.value = modulesResult.value.data.data || [];
  }

  if (logsResult.status === 'fulfilled') {
    const videoLogs = logsResult.value.data.data || [];
    const cw = videoLogs
      .filter(v => v.is_complete === 0)
      .sort((a, b) => new Date(b.updated_date) - new Date(a.updated_date));
    continueWatching.value = cw;
    if (cw.length && cw[0].module_detail) {
      continueLesson.value = cw[0].module_detail.title || continueLesson.value;
      continueModuleId.value = cw[0].parent_id;
      doneCount.value = videoLogs.filter(v => v.is_complete === 1).length;
      remainCount.value = cw.length;
    }
  }
});
</script>

<style scoped>
.santri-home {
  max-width: 1280px;
  margin: 0 auto;
  overflow-x: hidden;
  padding: 24px 20px;
}
.home-greeting {
  font-size: 2rem;
  color: var(--serene-on-surface);
  word-break: break-word;
  max-width: 100%;
}
.home-sub { color: var(--serene-on-surface-variant); font-size: 1rem; margin-top: 4px; }
.streak-chip { border-radius: 16px; }
.home-header { margin-bottom: 28px; }
.home-progress { border-radius: 16px; min-height: 200px; padding: 24px; }
.home-progress-deco {
  position: absolute; right: -40px; bottom: -40px;
  width: 200px; height: 200px; border-radius: 50%;
  background: var(--serene-primary-container); opacity: .07;
}
.home-continue { border-radius: 16px; min-height: 200px; background: var(--serene-primary); padding: 24px; }
.serene-btn-light {
  background: #fff; color: var(--serene-primary);
  border-radius: 12px; font-weight: 600;
  transition: transform .15s ease;
}
.serene-btn-light:active { transform: scale(.97); }
.home-continue-deco {
  position: absolute; top: 0; right: 0;
  background: rgba(255,255,255,.12);
  width: 120px; height: 120px; border-bottom-left-radius: 100%;
}
.serene-card, .serene-card-soft { padding: 24px; }
.quick-action { border-radius: 16px; padding: 22px; width: 100%; }
.quick-icon {
  width: 44px; height: 44px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
}
.qa-primary { background: var(--serene-primary-container); color: var(--serene-primary); }
.qa-gold { background: var(--serene-secondary-container); color: var(--serene-secondary); }
.qa-tertiary { background: var(--serene-tertiary); color: #fff; }
.serene-chip { border-radius: 9999px; }
.santri-grid-3 { display: grid; grid-template-columns: repeat(12, 1fr); gap: 20px; margin-bottom: 20px; }
.santri-grid-3 > .col-md-8 { grid-column: span 8; }
.santri-grid-3 > .col-md-4 { grid-column: span 4; }
.santri-grid-4 { display: grid; grid-template-columns: repeat(12, 1fr); gap: 20px; margin-bottom: 20px; }
.santri-grid-4 > .col-md-3 { grid-column: span 3; }
.santri-grid-2 { display: grid; grid-template-columns: repeat(12, 1fr); gap: 20px; margin-bottom: 20px; align-items: stretch; }
.santri-grid-2 > .col-md-7 { grid-column: span 7; }
.santri-grid-2 > .col-md-5 { grid-column: span 5; display: flex; flex-direction: column; gap: 20px; }
.search-bar { max-width: 480px; box-shadow: 0 2px 8px rgba(5,150,105,.08); }
.section-title { font-weight: 600; }
@media (max-width: 1023px) {
  .santri-grid-3 > .col-md-8, .santri-grid-3 > .col-md-4 { grid-column: span 12; }
  .santri-grid-4 > .col-md-3 { grid-column: span 6; }
  .santri-grid-2 > .col-md-7, .santri-grid-2 > .col-md-5 { grid-column: span 12; }
  .home-greeting { font-size: 1.4rem; line-height: 1.3; }
  .home-header { margin-bottom: 20px !important; }
  .home-progress, .home-continue { min-height: auto; }
  /* Spacing lebih lega di mobile */
  .santri-home { padding-left: 14px; padding-right: 14px; }
  .santri-grid-3, .santri-grid-4, .santri-grid-2 { row-gap: 14px; }
  .serene-card, .serene-card-soft { padding: 16px; }
  .quick-action { padding: 16px; }
  .tajwid-section { margin-top: 32px; }
  .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
  /* Cegah scroll horizontal di seluruh layout mobile */
  body, #q-app, .q-layout, .q-page-container { overflow-x: hidden; max-width: 100vw; }
  .q-footer { position: fixed; bottom: 0; left: 0; right: 0; }
  .q-page-container { padding-bottom: 64px; }
}
</style>
