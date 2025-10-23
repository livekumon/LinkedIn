const express = require('express');
const router = express.Router();
const planController = require('../controllers/planController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// Plan routes
router.get('/plans', planController.getAllPlans);
router.post('/plans', planController.createPlan); // Admin only
router.get('/plans/:id', planController.getPlanById);
router.put('/plans/:id', planController.updatePlan); // Admin only
router.delete('/plans/:id', planController.deletePlan); // Admin only

// Feature routes
router.get('/features', planController.getAllFeatures);
router.post('/features', planController.createFeature); // Admin only
router.get('/features/:id', planController.getFeatureById);
router.put('/features/:id', planController.updateFeature); // Admin only
router.delete('/features/:id', planController.deleteFeature); // Admin only

// User plan info
router.get('/user/plan-info', planController.getUserPlanInfo);

module.exports = router;

