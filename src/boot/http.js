// Boot file: mencegah Cloudflare/CDN menyajikan cached 404 stale untuk request API.
// CATATAN: jangan tambahkan query param (?_t=) ke URL karena Feathers menolak
// query tak dikenal dengan 422 (additionalProperties:false di query schema).
// Cukup gunakan header Cache-Control / Pragma no-cache.
import axios from 'axios'

export default ({}) => {
  axios.interceptors.request.use((config) => {
    config.headers = config.headers || {}
    config.headers['Cache-Control'] = 'no-cache'
    config.headers['Pragma'] = 'no-cache'
    return config
  })
}
