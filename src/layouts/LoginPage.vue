<template>
  <q-layout view="hHh lpR fFf" class="bg-green-gradient">
    <q-page-container>
      <q-page class="flex flex-center q-pa-md">
        <q-card class="glass-card q-pa-lg" style="width: 100%; max-width: 400px">
          <div class="flex flex-center q-mb-md">
            <q-avatar size="80px" class="bg-white text-green-7">
              <q-icon name="account_circle" size="60px" />
            </q-avatar>
          </div>

          <q-card-section class="text-center">
            <div class="text-h5 text-white q-mb-xs">Selamat Datang</div>
            <div class="text-caption text-grey-3">Silakan login untuk melanjutkan</div>
          </q-card-section>

          <q-card-section>
            <q-input
              v-model="username"
              label="Email"
              type="email"
              filled
              class="q-mb-md"
              dense
              color="white"
              input-class="text-white"
            />
            <q-input
              v-model="password"
              label="Password"
              :type="showPwd ? 'text' : 'password'"
              filled
              class="q-mb-md"
              dense
              color="white"
              input-class="text-white"
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
              color="green-10"
              class="full-width"
              unelevated
              @click="handleLogin"
            />
            <q-btn
              label="Daftar"
              flat
              class="full-width text-white q-mt-sm"
              @click="router.push('/register')"
            />
            <q-btn
              flat
              label="Lupa Password?"
              class="full-width text-grey-4 q-mt-xs"
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

    const res2 = await axios.get(`${api.API_BASE_URL}/profiles?user_id=${user.id}`, {
      headers: {
        Authorization: `${accessToken}`
      }
    });

    const { data } = res2.data;
    
    console.log("profile :",data);
    //const profile = dataprofile.total > 0 ? dataprofile.data[0] : null;

    // Simpan token dan informasi user
    localStorage.setItem("token", accessToken);
    localStorage.setItem("id", user.id);
    localStorage.setItem("email", user.email);
    localStorage.setItem("role", user.role || "user");
    localStorage.setItem("profile", JSON.stringify(data[0]));

    // Redirect ke dashboard
    if(user.role == "admin"){
      router.push("/dashboardadmin");
    }else if(user.role == "guru"){
      router.push("/dashboardguru");
    }else{
      router.push("/dashboardsantri");
    }
    

    $q.notify({
      type: "positive",
      message: "Login berhasil!",
      position: "top",
    });
  } catch (err) {
    $q.notify({
      type: "negative",
      message: "Login gagal: " + (err.response?.data?.message || "Server error"),
      position: "top",
    });
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
