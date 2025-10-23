const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./authRoutes');
const ideaRoutes = require('./ideaRoutes');
const linkedInRoutes = require('./linkedInRoutes');
const geminiRoutes = require('./geminiRoutes');
const linkedInPostRoutes = require('./linkedInPostRoutes');
const analyticsRoutes = require('./analyticsRoutes');
const planRoutes = require('./planRoutes');
const creditRoutes = require('./creditRoutes');
const paymentRoutes = require('./paymentRoutes');
const tagSetRoutes = require('./tagSetRoutes');
const referralRoutes = require('./referralRoutes');
const adminReferralRoutes = require('./adminReferralRoutes');

// Base API route
router.get('/', (req, res) => {
  res.json({ 
    message: 'API is running',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      ideas: '/api/ideas',
      linkedin: '/api/linkedin',
      gemini: '/api/gemini',
      linkedinPost: '/api/linkedin-post',
      analytics: '/api/analytics',
      subscription: '/api/subscription',
      credits: '/api/credits',
      payments: '/api/payments',
      tagsets: '/api/tagsets',
      referrals: '/api/referrals',
      adminReferrals: '/api/admin/referrals'
    }
  });
});

// Mount route modules
router.use('/auth', authRoutes);
router.use('/ideas', ideaRoutes);
router.use('/linkedin', linkedInRoutes);
router.use('/gemini', geminiRoutes);
router.use('/linkedin-post', linkedInPostRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/subscription', planRoutes);
router.use('/credits', creditRoutes);
router.use('/payments', paymentRoutes);
router.use('/tagsets', tagSetRoutes);
router.use('/referrals', referralRoutes);
router.use('/admin/referrals', adminReferralRoutes);

module.exports = router;

