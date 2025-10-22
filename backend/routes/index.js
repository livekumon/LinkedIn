const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./authRoutes');
const ideaRoutes = require('./ideaRoutes');
const linkedInRoutes = require('./linkedInRoutes');
const geminiRoutes = require('./geminiRoutes');
const linkedInPostRoutes = require('./linkedInPostRoutes');
const analyticsRoutes = require('./analyticsRoutes');

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
      analytics: '/api/analytics'
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

module.exports = router;

