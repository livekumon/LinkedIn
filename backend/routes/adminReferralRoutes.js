const express = require('express');
const router = express.Router();
const adminReferralController = require('../controllers/adminReferralController');
const { protect } = require('../middleware/auth');

// All routes require authentication
// TODO: Add admin role check middleware

// Analytics
router.get('/analytics', protect, adminReferralController.getReferralAnalytics);

// Referral Plans Management
router.get('/plans', protect, adminReferralController.getAllReferralPlans);
router.get('/plans/active', protect, adminReferralController.getActiveReferralPlan);
router.post('/plans', protect, adminReferralController.createReferralPlan);
router.put('/plans/:id', protect, adminReferralController.updateReferralPlan);
router.delete('/plans/:id', protect, adminReferralController.deleteReferralPlan);
router.patch('/plans/:id/toggle-status', protect, adminReferralController.toggleReferralPlanStatus);

module.exports = router;

