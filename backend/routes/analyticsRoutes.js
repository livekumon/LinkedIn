const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

// Analytics routes
router.get('/dashboard', protect, analyticsController.getDashboardAnalytics);
router.get('/performance', protect, analyticsController.getPerformanceMetrics);

module.exports = router;
