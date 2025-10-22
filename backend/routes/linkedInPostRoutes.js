const express = require('express');
const router = express.Router();
const linkedInPostController = require('../controllers/linkedInPostController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

router.post('/post', linkedInPostController.postArticle);
router.post('/schedule', linkedInPostController.scheduleArticle);

module.exports = router;


