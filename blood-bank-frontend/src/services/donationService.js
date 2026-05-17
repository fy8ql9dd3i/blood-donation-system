import api from './api';

const donationService = {
  getAllDonations: async () => {
    const response = await api.get('/donations');
    return response.data;
  },
  getDonorHistory: async (phone) => {
    const response = await api.get(`/donations/history?phone=${phone}`);
    return response.data;
  }
};

export default donationService;
