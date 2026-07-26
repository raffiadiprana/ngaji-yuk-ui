<template>
  <q-layout view="hHh lpR fFf" class="bg-green-gradient">
    <q-page-container>
      <q-page class="flex flex-center q-pa-md">
        <q-card class="glass-card q-pa-lg" style="width: 100%; max-width: 400px">
          <div class="flex flex-center q-mb-md">
            <q-avatar size="80px" class="bg-white text-green-7">
              <q-icon name="lock_reset" size="60px" />
            </q-avatar>
          </div>

          <q-card-section class="text-center">
            <div class="text-h5 text-white q-mb-xs">Lupa Password</div>
            <div class="text-caption text-grey-3">Masukkan email dan password baru</div>
          </q-card-section>

          <q-card-section>
            <q-input
              v-model="form.email"
              label="Email"
              type="email"
              filled
              dense
              color="white"
              input-class="text-white"
              class="q-mb-sm"
            />
            <q-input
              v-model="form.newPassword"
              label="Password Baru"
              type="password"
              filled
              dense
              color="white"
              input-class="text-white"
              class="q-mb-sm"
            />
            <q-btn
              label="Reset Password"
              color="green-10"
              unelevated
              class="full-width q-mt-md"
              :loading="loading"
              @click="handleReset"
            />
            <q-btn
              flat
              label="Kembali ke Login"
              class="full-width text-white q-mt-sm"
              @click="router.push('/')"
            />
          </q-card-section>
        </q-card>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";
import api from "src/config/api";

const router = useRouter();
const $q = useQuasar();
const loading = ref(false);
const form = ref({
  email: "",
  newPassword: ""
});

const handleReset = async () => {
  if (!form.value.email || !form.value.newPassword) {
    $q.notify({ type: "warning", message: "Email dan password baru wajib diisi", position: "top" });
    return;
  }
  if (form.value.newPassword.length < 6) {
    $q.notify({ type: "warning", message: "Password baru minimal 6 karakter", position: "top" });
    return;
  }

  loading.value = true;
  try {
    const res = await fetch(`${api.API_BASE_URL}/password-reset`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.value.email, newPassword: form.value.newPassword })
    });
    const data = await res.json();
    $q.notify({ type: "positive", message: data.message || "Password berhasil direset", position: "top" });
    router.push("/");
  } catch (err) {
    console.error(err);
    $q.notify({ type: "negative", message: "Gagal mereset password", position: "top" });
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.bg-green-gradient {
  background: linear-gradient(to bottom right, #2e817c, #3f9e5f);
  min-height: 100vh;
}

.glass-card {
  backdrop-filter: blur(15px);
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
}
</style>
