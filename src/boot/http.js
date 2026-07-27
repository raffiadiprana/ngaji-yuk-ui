// Boot file: mendaftarkan axios interceptor global agar request ke API
// tidak pernah di-cache oleh Cloudflare/CDN (mencegah cached 404 stale).
// Berlaku ke semua `import axios from 'axios'` karena axios default adalah singleton.
import axios from 'axios'

export default ({}) => {
  axios.interceptors.request.use((config) => {
    config.headers = config.headers || {}
    config.headers['Cache-Control'] = 'no-cache'
    config.headers['Pragma'] = 'no-cache'

    // Cache-buster: tambah ?_t=timestamp agar CDN tidak sajikan response lama
    if (config.url) {
      const sep = config.url.includes('?') ? '&' : '?'
      if (!/[?&]_t=/.test(config.url)) {
        config.url = `${config.url}${sep}_t=${Date.now()}`
      }
    }
    return config
  })
}
