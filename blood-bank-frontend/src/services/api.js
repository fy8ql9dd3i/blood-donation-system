/**
 * Axios instance for the blood donation API.
 *
 * Development (npm run dev):
 * - Prefer base URL `/api` so Vite proxies to the backend (see vite.config.ts). No CORS issues.
 * - Or set REACT_APP_API_URL / VITE_API_URL to a full URL (e.g. http://localhost:5000/api) to call the API directly.
 *
 * Production build:
 * - Set REACT_APP_API_URL or VITE_API_URL to your deployed API, e.g. https://api.example.com/api
 */
import axios from 'axios'

function resolveBaseURL() {
  const fromEnv =
    import.meta.env.REACT_APP_API_URL || import.meta.env.VITE_API_URL
  if (fromEnv && String(fromEnv).trim()) {
    return String(fromEnv).replace(/\/$/, '')
  }
  if (import.meta.env.DEV) {
    return '/api'
  }
  return 'http://127.0.0.1:5000/api'
}

const baseURL = resolveBaseURL()

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

export default api
