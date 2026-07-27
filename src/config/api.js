const envUrl = import.meta.env.VITE_API_URL
// Hanya pakai env kalau benar-benar menunjuk ke API (domain onrender).
// Jika env kosong atau salah diset ke domain UI, fallback ke API URL tetap.
const baseUrl = (envUrl && envUrl.includes('onrender'))
  ? envUrl
  : 'https://ngaji-yuk-api.onrender.com'

export default {
  API_BASE_URL: baseUrl,
  API_UPLOADS_URL: `${baseUrl}/uploads`
};
