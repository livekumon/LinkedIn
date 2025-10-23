const express = require('express');
const router = express.Router();
const referralController = require('../controllers/referralController');
const adminReferralController = require('../controllers/adminReferralController');
const { protect } = require('../middleware/auth');

// Protected routes
router.get('/my-code', protect, referralController.getReferralCode);
router.get('/stats', protect, referralController.getReferralStats);

// Public routes
router.post('/validate', referralController.validateReferralCode);
router.get('/active-plan', adminReferralController.getActiveReferralPlan);

module.exports = router;

