// Helper otentikasi terpusat untuk seluruh UI Ngaji Yuk.
const TOKEN_KEY = 'token'

export function getToken () {
  return localStorage.getItem(TOKEN_KEY)
}

export function clearAuth () {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem('id')
  localStorage.removeItem('email')
  localStorage.removeItem('role')
  localStorage.removeItem('profile')
}

// Header Authorization untuk axios/fetch, tanpa prefix "Bearer"
// karena FeathersJS mengharapkan token mentah di header Authorization.
export function authHeader () {
  const token = getToken()
  return token ? { Authorization: token } : {}
}

export function isTokenValid () {
  const token = getToken()
  if (!token) return false
  try {
    const payload = JSON.parse(atob(token.split('.')[ 1 ]))
    return payload.exp * 1000 > Date.now()
  } catch {
    return false
  }
}
