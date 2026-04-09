/**
 * Hospital staff endpoints (blood requests + hospital profile + map helpers).
 * In pages, wrap these with `useQuery` / `useMutation` from TanStack Query so results are cached
 * and refetched intelligently (see ViewAvailability.jsx for two parallel queries).
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

/**
 * GET /api/map/donor-locations — donors that have latitude/longitude (from registration geocoding).
 * Allowed roles: hospital_staff, blood_bank_staff, admin. Used on the availability map.
 */
export async function getDonorLocationsForMap() {
  const { data } = await api.get('/map/donor-locations')
  return data
}
