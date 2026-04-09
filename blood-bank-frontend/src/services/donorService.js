import api from './api';

const donorService = {
  register: async (donorData) => {
    const response = await api.post('/donors', donorData);
    return response.data;
  },
  getAll: async () => {
    const response = await api.get('/donors');
    return response.data;
  },
  searchByPhone: async (phone) => {
    const response = await api.get(`/donors/phone/${phone}`);
    return response.data;
  },
  updatePhone: async (oldPhone, newPhone) => {
    const response = await api.patch('/donors/update-phone', { oldPhone, newPhone });
    return response.data;
  },
  donate: async (donorId, units) => {
    const response = await api.post('/donations', { donorId, units });
    return response.data;
  }
};

export default donorService;
