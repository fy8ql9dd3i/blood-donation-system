/**
 * Blood inventory — typically used by blood bank staff; hospitals can read stock levels
 * when the backend allows their role on GET /inventory.
 */
import api from './api'

/** GET /api/inventory — list stock rows (blood type, quantity, expiry, status, …) */
export async function getInventory() {
  const { data } = await api.get('/inventory')
  return data
}

/** POST /api/inventory — add or merge units for a blood type + expiry date */
export async function addOrUpdateStock(payload) {
  const { data } = await api.post('/inventory', payload)
  return data
}

/** GET /api/inventory/alerts — low-stock / expiry alerts for the bank dashboard */
export async function getInventoryAlerts() {
  const { data } = await api.get('/inventory/alerts')
  return data
}

/** DELETE /api/inventory/:id — discard a blood inventory item */
export async function deleteInventoryItem(id) {
  const { data } = await api.delete(`/inventory/${id}`)
  return data
}

/** DELETE /api/inventory/purge-expired — purge all expired blood stock at once */
export async function purgeExpiredStock() {
  const { data } = await api.delete('/inventory/purge-expired')
  return data
}

/** DELETE /api/inventory/purge-all — purge all blood stock at once */
export async function purgeAllStock() {
  const { data } = await api.delete('/inventory/purge-all')
  return data
}
