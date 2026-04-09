/**
 * Authentication & staff registration API calls.
 * Uses shared `api` (Axios) — JWT is attached automatically when `localStorage.token` is set.
 */
import api from './api'

/** POST /api/auth/login */
export async function login(credentials) {
  const { data } = await api.post('/auth/login', credentials)
  return data
}

/** POST /api/auth/logout */
export async function logout() {
  const { data } = await api.post('/auth/logout')
  return data
}

/**
 * POST /api/auth/register-first-admin — public, only works if no admin exists yet.
 * Response: { token, user: { id, name, email, role } }
 */
export async function registerFirstAdmin(payload) {
  const { data } = await api.post('/auth/register-first-admin', payload)
  return data
}

// [registerHospitalStaffSelf REMOVED - Admin must register hospitals now]

/** GET /api/hospitals/public-list — public; id + name for signup dropdown */
export async function fetchPublicHospitalList() {
  const { data } = await api.get('/hospitals/public-list')
  return data
}

/**
 * POST /api/hospitals/register — admin or blood_bank_staff JWT.
 * Body: name, address, phoneNumber, latitude?, longitude?
 */
export async function registerHospitalOrganization(payload) {
  const { data } = await api.post('/hospitals/register', payload)
  return data
}

/** POST /api/auth/register-blood-bank-staff — admin or blood_bank_staff JWT */
export async function registerBloodBankStaff(payload) {
  const { data } = await api.post('/auth/register-blood-bank-staff', payload)
  return data
}

/** POST /api/auth/register-hospital-staff — admin JWT; body includes hospitalId */
export async function registerHospitalStaff(payload) {
  const { data } = await api.post('/auth/register-hospital-staff', payload)
  return data
}
