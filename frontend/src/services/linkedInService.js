import api from './api';

export const linkedInAPI = {
  getConnectionStatus: () => api.get('/linkedin/status'),
  getLinkedInAuthUrl: () => api.get('/linkedin/auth-url'),
  disconnectLinkedIn: () => api.post('/linkedin/disconnect'),
};

export default linkedInAPI;

