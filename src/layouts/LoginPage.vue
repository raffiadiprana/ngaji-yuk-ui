<template>
  <q-layout view="hHh lpR fFf" class="aurora-bg-soft serene-auth">
    <q-page-container>
      <q-page class="flex flex-center q-pa-md">
        <q-card class="serene-auth-card q-pa-xl" style="width: 100%; max-width: 420px">
          <div class="flex flex-center q-mb-md">
            <q-avatar size="76px" class="bg-serene-primary text-white shadow-2">
              <q-icon name="menu_book" size="44px" />
            </q-avatar>
          </div>

          <q-card-section class="text-center q-pb-none">
            <div class="headline-font text-h5 text-serene-on-surface q-mb-xs">Selamat Datang</div>
            <div class="text-body2 text-serene-variant">Silakan login untuk melanjutkan</div>
          </q-card-section>

          <q-card-section>
            <q-form @submit.prevent="handleLogin">
              <q-input
                v-model="username"
                label="Email"
                type="email"
                filled
                dense
                class="q-mb-md serene-input"
                color="serene-primary"
              />
              <q-input
                v-model="password"
                label="Password"
                :type="showPwd ? 'text' : 'password'"
                filled
                dense
                class="q-mb-md serene-input"
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
                label="Login"
                type="submit"
                unelevated
                class="full-width serene-btn-primary q-py-sm"
              />
            </q-form>
            <q-btn
              label="Daftar"
              flat
              class="full-width text-serene-primary q-mt-sm"
              @click="router.push('/register')"
            />
            <q-btn
              label="Lupa Password?"
              flat
              class="full-width text-serene-variant q-mt-xs"
              @click="router.push('/forgot')"
            />
          </q-card-section>
        </q-card>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import axios from "axios";
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";
import usersData from "src/data/users.json";
import api from "src/config/api";
import { authHeader } from "src/config/auth";

const $q = useQuasar();
const username = ref("");
const password = ref("");
const showPwd = ref(false);
const router = useRouter();

const handleLogin = async () => {
  try {
    const res = await axios.post(`${api.API_BASE_URL}/authentication`, {
      strategy: "local",
      email: username.value,
      password: password.value,
    });

    const { accessToken, user } = res.data;

    localStorage.setItem("token", accessToken);
    localStorage.setItem("id", user.id);
    localStorage.setItem("email", user.email);
    localStorage.setItem("role", user.role || "user");
    localStorage.setItem("displayName", user.display_name || user.email);

    let profileData = {};
    try {
      const res2 = await axios.get(`${api.API_BASE_URL}/profiles?user_id=${user.id}`, {
        headers: authHeader()
      });
      profileData = res2.data.data?.[0] || {};
      if (profileData.avatar) localStorage.setItem("avatar", api.API_UPLOADS_URL + profileData.avatar);
      if (profileData.display_name) localStorage.setItem("displayName", profileData.display_name);
    } catch (e) {
      console.error("Gagal ambil profil:", e);
    }
    localStorage.setItem("profile", JSON.stringify(profileData));

    const target =
      user.role === "admin" ? "/dashboardadmin"
      : user.role === "guru" ? "/dashboardguru"
      : "/dashboardsantri";

    $q.notify({ type: "positive", message: "Login berhasil!", position: "top" });
    await router.push(target);
  } catch (err) {
    console.error(err);
    $q.notify({
      type: "negative",
      message: "Login gagal: " + (err.response?.data?.message || "Server error"),
      position: "top",
    });
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
