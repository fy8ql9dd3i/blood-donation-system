/**
 * Hospital staff endpoints (blood requests + hospital profile).
 * In pages, wrap these with `useQuery` / `useMutation` from TanStack Query so results are cached
 * and refetched intelligently.
 */
import api from './api'

/** GET /api/hospitals/profile — JWT must be hospital_staff or admin */
export async function getHospitalProfile() {
  const { data } = await api.get('/hospitals/profile')
  return data
}

/** GET /api/requests/hospital/me — list requests for the logged-in hospital */
export async function getMyBloodRequests() {
  const { data } = await api.get('/requests/hospital/me')
  return data
}

/** POST /api/requests — submit emergency or routine blood request */
export async function submitBloodRequest(payload) {
  const { data } = await api.post('/requests', payload)
  return data
}

export async function listPublicHospitals() {
  const { data } = await api.get('/hospitals/public-list')
  return data
}
export async function getMyDispatches() {
  const { data } = await api.get('/requests/hospital/dispatches')
  return data
}

export async function sendThankYouLetter(payload) {
  const { data } = await api.post('/appreciation/send', payload)
  return data
}
