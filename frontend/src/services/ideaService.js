import api from './api';

export const ideaAPI = {
  // Create new idea
  createIdea: (data) => api.post('/ideas', data),
  
  // Get all ideas
  getAllIdeas: (params) => api.get('/ideas', { params }),
  
  // Get idea by ID
  getIdeaById: (id) => api.get(`/ideas/${id}`),
  
  // Update idea
  updateIdea: (id, data) => api.put(`/ideas/${id}`, data),
  
  // Delete idea (soft delete)
  deleteIdea: (id) => api.delete(`/ideas/${id}`),
  
  // Get favorite ideas
  getFavoriteIdeas: () => api.get('/ideas/favorites'),
  
  // Get ideas statistics
  getIdeasStats: () => api.get('/ideas/stats'),
  
  // Recycle bin operations
  getDeletedIdeas: () => api.get('/ideas/deleted/all'),
  restoreIdea: (id) => api.put(`/ideas/deleted/${id}/restore`),
  permanentDeleteIdea: (id) => api.delete(`/ideas/deleted/${id}/permanent`),
};

export default ideaAPI;

