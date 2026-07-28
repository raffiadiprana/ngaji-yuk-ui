<template>
  <q-layout view="hHh lpR fFf" class="aurora-bg-soft serene-auth">
    <q-page-container>
      <q-page class="flex flex-center q-pa-md">
        <q-card class="serene-auth-card q-pa-lg" style="width: 100%; max-width: 400px">
          <div class="flex flex-center q-mb-md">
            <q-avatar size="80px" class="bg-serene-primary text-white shadow-2">
              <q-icon name="lock_reset" size="60px" />
            </q-avatar>
          </div>

          <q-card-section class="text-center">
            <div class="headline-font text-h5 text-serene-on-surface q-mb-xs">Lupa Password</div>
            <div class="text-caption text-serene-variant">
              {{ step === 1 ? 'Masukkan email Anda untuk memulai' : 'Buat password baru untuk akun Anda' }}
            </div>
          </q-card-section>

          <q-card-section>
            <!-- STEP 1: cari email -->
            <template v-if="step === 1">
              <q-input
                v-model="email"
                label="Email"
                type="email"
                filled
                dense
                class="serene-input q-mb-sm"
                color="serene-primary"
              />
              <q-btn
                label="Cari Akun"
                unelevated
                class="full-width serene-btn-primary q-mt-md"
                :loading="loading"
                @click="handleCheck"
              />
            </template>

            <!-- STEP 2: input password baru -->
            <template v-else>
              <q-input
                v-model="newPassword"
                label="Password Baru"
                :type="showPwd ? 'text' : 'password'"
                filled
                dense
                class="serene-input q-mb-sm"
                color="serene-primary"
              >
                <template v-slot:append>
                  <q-icon
                    :name="showPwd ? 'visibility' : 'visibility_off'"
                    class="cursor-pointer"
                    @click="showPwd = !showPwd"
                  />
                </template>
              </q-input>
              <q-btn
                label="Reset Password"
                unelevated
                class="full-width serene-btn-primary q-mt-md"
                :loading="loading"
                @click="handleReset"
              />
              <q-btn
                flat
                label="Kembali"
                class="full-width text-serene-primary q-mt-xs"
                @click="step = 1"
              />
            </template>

            <q-btn
              flat
              label="Kembali ke Login"
              class="full-width text-serene-variant q-mt-sm"
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
const step = ref(1);
const email = ref("");
const newPassword = ref("");
const showPwd = ref(false);

const handleCheck = async () => {
  if (!email.value) {
    $q.notify({ type: "warning", message: "Email wajib diisi", position: "top" });
    return;
  }
  loading.value = true;
  try {
    const res = await fetch(`${api.API_BASE_URL}/password-reset`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.value, step: "check" })
    });
    const data = await res.json();
    if (data.exists) {
      $q.notify({
        type: "positive",
        message: "Email terdaftar. Silakan buat password baru.",
        position: "top"
      });
      step.value = 2;
    } else {
      $q.notify({
        type: "negative",
        message: "Email tidak ditemukan dalam sistem.",
        position: "top"
      });
    }
  } catch (err) {
    console.error(err);
    $q.notify({ type: "negative", message: "Gagal memeriksa email.", position: "top" });
  } finally {
    loading.value = false;
  }
};

const handleReset = async () => {
  if (!newPassword.value) {
    $q.notify({ type: "warning", message: "Password baru wajib diisi", position: "top" });
    return;
  }
  if (newPassword.value.length < 6) {
    $q.notify({ type: "warning", message: "Password baru minimal 6 karakter", position: "top" });
    return;
  }
  loading.value = true;
  try {
    const res = await fetch(`${api.API_BASE_URL}/password-reset`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.value, newPassword: newPassword.value })
    });
    const data = await res.json();
    if (data.success) {
      $q.notify({ type: "positive", message: data.message || "Password berhasil direset.", position: "top" });
      router.push("/");
    } else {
      $q.notify({ type: "negative", message: data.message || "Reset password gagal.", position: "top" });
    }
  } catch (err) {
    console.error(err);
    $q.notify({ type: "negative", message: "Gagal mereset password.", position: "top" });
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.serene-auth {
  min-height: 100vh;
}

.serene-auth-card {
  background: #ffffff;
  border-radius: 20px;
  border: 1px solid var(--serene-outline-variant);
  box-shadow: 0 12px 40px rgba(5, 150, 105, 0.1);
}

.serene-input :deep(.q-field__control) {
  border-radius: 12px;
}
</style>
