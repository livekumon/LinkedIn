const express = require('express');
const router = express.Router();
const creditController = require('../controllers/creditController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// Credit transaction routes
router.get('/transactions', creditController.getCreditTransactions);
router.get('/stats', creditController.getCreditStats);
router.get('/idea/:ideaId', creditController.getIdeaCredits);
router.get('/usage-by-idea', creditController.getCreditUsageByIdea);
router.get('/usage-by-article', creditController.getCreditUsageByArticle);

module.exports = router;

