import api from './api';

export const creditAPI = {
  getCreditTransactions: () => api.get('/credits/transactions'),
  getUserCredits: () => api.get('/credits/user'),
  getIdeaCredits: (ideaId) => api.get(`/credits/idea/${ideaId}`),
  getCreditUsageByIdea: () => api.get('/credits/usage-by-idea'),
  getCreditUsageByArticle: () => api.get('/credits/usage-by-article'),
};

export default creditAPI;
