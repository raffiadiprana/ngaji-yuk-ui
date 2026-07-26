const baseUrl = import.meta.env.VITE_API_URL || 'https://ngaji-yuk-api.onrender.com'

export default {
  API_BASE_URL: baseUrl,
  API_UPLOADS_URL: `${baseUrl}/uploads`
};
