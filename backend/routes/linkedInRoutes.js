const express = require('express');
const router = express.Router();
const linkedInController = require('../controllers/linkedInController');
const { protect } = require('../middleware/auth');

// OAuth callback (not protected)
router.get('/callback', linkedInController.linkedInCallback);

// Protected routes
router.get('/auth-url', protect, linkedInController.getLinkedInAuthUrl);
router.get('/status', protect, linkedInController.getConnectionStatus);
router.post('/disconnect', protect, linkedInController.disconnectLinkedIn);

module.exports = router;

