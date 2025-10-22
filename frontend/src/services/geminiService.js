import api from './api';

export const geminiAPI = {
  generateArticle: (ideaId, tone = 'default', regenerate = false, includeSources = false) => 
    api.post('/gemini/generate-article', { ideaId, tone, regenerate, includeSources }),
  getArticleVersions: (ideaId) => api.get(`/gemini/article-versions/${ideaId}`),
  selectVersion: (versionId) => api.post('/gemini/select-version', { versionId }),
};

export default geminiAPI;
