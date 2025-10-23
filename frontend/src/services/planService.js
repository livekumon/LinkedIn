import api from './api';

export const planAPI = {
  // Plans
  getAllPlans: () => api.get('/subscription/plans'),
  getPlanById: (id) => api.get(`/subscription/plans/${id}`),
  getUserPlanInfo: () => api.get('/subscription/user-plan'),
  
  // Features
  getAllFeatures: () => api.get('/subscription/features'),
  getFeatureById: (id) => api.get(`/subscription/features/${id}`),
};

export default planAPI;

