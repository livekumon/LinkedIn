import api from './api';

export const tagSetAPI = {
  getAllTagSets: () => api.get('/tagsets'),
  getDefaultTagSet: () => api.get('/tagsets/default'),
  createTagSet: (data) => api.post('/tagsets', data),
  updateTagSet: (id, data) => api.put(`/tagsets/${id}`, data),
  setDefaultTagSet: (id) => api.put(`/tagsets/${id}/set-default`),
  recordUsage: (id) => api.put(`/tagsets/${id}/record-usage`),
  deleteTagSet: (id) => api.delete(`/tagsets/${id}`),
};

export default tagSetAPI;



