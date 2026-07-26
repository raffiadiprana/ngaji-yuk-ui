// Guard otentikasi tunggal untuk semua route terproteksi.
// Menggantikan duplikasi beforeEnter di routes.js (14x blok sama).
import { getToken, clearAuth } from 'src/config/auth'

export function requireAuth (to, from, next) {
  const token = getToken()
  if (!token) {
    next('/')
    return
  }
  try {
    const payload = JSON.parse(atob(token.split('.')[ 1 ]))
    if (payload.exp * 1000 < Date.now()) {
      clearAuth()
      next('/')
    } else {
      next()
    }
  } catch {
    clearAuth()
    next('/')
  }
}
