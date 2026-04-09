/**
 * Lab verification — records screening results for a donor after mobile registration.
 * POST body must match backend `lab.controller` (donorId, blood_type, tests, vitals, etc.).
 */
import api from './api'

/** POST /api/lab/add — blood_bank_staff only */
export async function submitLabResults(payload) {
  const { data } = await api.post('/lab/add', payload)
  return data
}
