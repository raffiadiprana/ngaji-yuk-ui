// Guard otentikasi tunggal untuk semua route terproteksi.
// Menggantikan duplikasi beforeEnter di routes.js (14x blok sama).
import { getToken } from 'src/config/auth'

export function requireAuth (to, from, next) {
  const token = getToken()
  if (!token) {
    next('/')
    return
  }
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    // Jika tidak ada exp, anggap masih valid (hindari lockout)
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      next('/')
    } else {
      next()
    }
  } catch (e) {
    // Token rusak: biarkan lewat ke halaman, biar API yang tolak (401)
    // daripada mengunci user di login.
    console.error('requireAuth: token parse failed', e)
    next()
  }
}
