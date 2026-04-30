import api from './api'

export const broadcastEmergency = async (bloodType, message) => {
  const response = await api.post('/notifications/broadcast', { bloodType, message })
  return response.data
}

export const broadcastToAll = async (title, message) => {
  const response = await api.post('/notifications/broadcast-all', { title, message })
  return response.data
}

export const getNotifications = async () => {
  const response = await api.get('/notifications')
  return response.data
}
