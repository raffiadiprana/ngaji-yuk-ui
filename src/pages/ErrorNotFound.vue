<template>
  <div class="error-not-found fullscreen q-pa-md flex flex-center">
    <q-card class="serene-card error-card text-center q-pa-xl">
      <div class="error-code headline-font">404</div>
      <div class="text-h6 text-serene-variant q-mb-lg">Oops. Halaman tidak ditemukan</div>
      <q-btn
        class="serene-btn-primary"
        unelevated
        to="/"
        label="Kembali ke Beranda"
        no-caps
      />
    </q-card>
  </div>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'ErrorNotFound'
})
</script>

<style scoped>
.error-not-found {
  background: var(--serene-bg);
  min-height: 100vh;
}
.error-card {
  max-width: 420px;
  width: 100%;
  border-radius: 20px;
}
.error-code {
  font-size: 28vh;
  line-height: 1;
  color: var(--serene-primary);
}
</style>
