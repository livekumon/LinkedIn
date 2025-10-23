import api from './api';

export const referralAPI = {
  getMyReferralCode: () => api.get('/referrals/my-code'),
  getReferralStats: () => api.get('/referrals/stats'),
  validateReferralCode: (code) => api.post('/referrals/validate', { code }),
  getActiveReferralPlan: () => api.get('/referrals/active-plan'),
};

export default referralAPI;

