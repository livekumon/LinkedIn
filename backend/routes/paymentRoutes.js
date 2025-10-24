const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// Payment routes
router.post('/create-order', paymentController.createOrder);
router.post('/capture-order', paymentController.captureOrder);
router.get('/history', paymentController.getPaymentHistory);
router.get('/:id', paymentController.getPaymentById);

module.exports = router;




