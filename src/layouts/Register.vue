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
            <q-form @submit.prevent="handleRegister">
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
                v-model="form.password"
                label="Password"
                :type="showPwd ? 'text' : 'password'"
                filled
                dense
                color="white"
                input-class="text-white"
                class="q-mb-sm"
              >
                <template v-slot:append>
                  <q-icon
                    :name="showPwd ? 'visibility' : 'visibility_off'"
                    class="cursor-pointer"
                    @click="showPwd = !showPwd"
                  />
                </template>
              </q-input>
              <q-input
                v-model="form.display_name"
                label="Nama Tampilan"
                filled
                dense
                color="white"
                input-class="text-white"
                class="q-mb-sm"
              />
              <q-input
                v-model="form.jobtitle"
                label="Pekerjaan / Kegiatan Saat Ini"
                filled
                dense
                color="white"
                input-class="text-white"
                class="q-mb-sm"
              />
              <q-uploader
                ref="uploaderRef"
                label="Upload Avatar"
                accept=".jpg, .png, .jpeg"
                :auto-upload="false"
                @added="onFileAdded"
                class="q-mb-sm"
              />
              <q-btn
                label="Daftar"
                color="white"
                text-color="green-10"
                class="full-width q-mt-md"
                type="submit"
              />
            </q-form>
            <q-btn
              flat
              label="Sudah punya akun? Login"
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
const autoupload = false;
const showPwd = ref(false);
const form = ref({
  email: "",
  password: "",
  display_name: "",
  jobtitle: "",
  file: null
})

const uploaderRef = ref(null)

const onFileAdded = files => {
  form.value.file = files[0]  // Simpan file pertama
}

const handleRegister = async () => {
  try {
    // Step 1: Register user
    const userRes = await fetch(`${api.API_BASE_URL}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.value.email, password: form.value.password, role: "santri" })
    });

    const user = await userRes.json();

    console.log('user response :', user);

    // Step 2: Upload avatar
    const formData = new FormData();

    console.log('Upload form.value.file :', form.value.file);

    formData.append("file", form.value.file);

    const uploadRes = await fetch(`${api.API_BASE_URL}/uploads`, {
      method: "POST",
      body: formData
    });

    const upload = await uploadRes.json();

    console.log('Upload response:', upload);

    // Step 3: Save profile
    await fetch(`${api.API_BASE_URL}/profiles`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: user.id,
        display_name: form.value.display_name,
        jobtitle: form.value.jobtitle,
        avatar: upload.filename
      })
    });

    $q.notify({ type: "positive", message: "Registrasi berhasil!" });
    router.push("/");

  } catch (err) {
    console.error(err);
    $q.notify({ type: "negative", message: "Gagal melakukan registrasi." });
  }
};
</script>
<style>
.q-uploader {
  width: 100%;
}
.q-uploader__header{
  background-color: #526659;
}
</style>
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
