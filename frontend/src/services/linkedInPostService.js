import api from './api';

export const linkedInPostAPI = {
  postArticle: (articleVersionId) => api.post('/linkedin-post/post', { articleVersionId }),
  scheduleArticle: (articleVersionId, scheduledAt) => api.post('/linkedin-post/schedule', { articleVersionId, scheduledAt }),
};

export default linkedInPostAPI;


