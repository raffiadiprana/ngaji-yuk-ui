<template>
  <q-layout view="hHh lpR fFf" class="aurora-bg-soft serene-auth">
    <q-page-container>
      <q-page class="flex flex-center q-pa-md">
        <q-card class="serene-auth-card q-pa-xl" style="width: 100%; max-width: 440px">
          <div class="flex flex-center q-mb-md">
            <q-avatar size="76px" class="bg-serene-primary text-white shadow-2">
              <q-icon name="person_add" size="44px" />
            </q-avatar>
          </div>

          <q-card-section class="text-center q-pb-none">
            <div class="headline-font text-h5 text-serene-on-surface q-mb-xs">Daftar Akun</div>
            <div class="text-body2 text-serene-variant">Bergabung belajar tajwid bersama</div>
          </q-card-section>

          <q-card-section>
            <q-form @submit.prevent="handleRegister">
              <q-input
                v-model="form.email"
                label="Email"
                type="email"
                filled
                dense
                class="q-mb-sm serene-input"
                color="serene-primary"
              />
              <q-input
                v-model="form.password"
                label="Password"
                :type="showPwd ? 'text' : 'password'"
                filled
                dense
                class="q-mb-sm serene-input"
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
              <q-input
                v-model="form.display_name"
                label="Nama Tampilan"
                filled
                dense
                class="q-mb-sm serene-input"
                color="serene-primary"
              />
              <q-input
                v-model="form.jobtitle"
                label="Pekerjaan / Kegiatan Saat Ini"
                filled
                dense
                class="q-mb-sm serene-input"
                color="serene-primary"
              />
              <q-uploader
                ref="uploaderRef"
                label="Upload Avatar"
                accept=".jpg, .png, .jpeg"
                :auto-upload="false"
                @added="onFileAdded"
                class="q-mb-sm serene-uploader"
              />
              <q-btn
                label="Daftar"
                type="submit"
                unelevated
                class="full-width serene-btn-primary q-py-sm q-mt-md"
              />
            </q-form>
            <q-btn
              flat
              label="Sudah punya akun? Login"
              class="full-width text-serene-primary q-mt-sm"
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
  form.value.file = files[0]
}

const handleRegister = async () => {
  try {
    const userRes = await fetch(`${api.API_BASE_URL}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.value.email, password: form.value.password, role: "santri" })
    });

    const user = await userRes.json();
    console.log('user response :', user);

    let avatarName = null;
    if (form.value.file) {
      const formData = new FormData();
      formData.append("file", form.value.file);
      const uploadRes = await fetch(`${api.API_BASE_URL}/uploads`, { method: "POST", body: formData });
      const upload = await uploadRes.json();
      avatarName = upload.filename;
      console.log('Upload response:', upload);
    }

    await fetch(`${api.API_BASE_URL}/profiles`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: user.id,
        display_name: form.value.display_name,
        jobtitle: form.value.jobtitle,
        avatar: avatarName
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
.serene-uploader {
  border-radius: 12px;
}
.serene-uploader .q-uploader__header {
  background-color: var(--serene-primary) !important;
}
</style>
