const express = require('express');
const router = express.Router();
const geminiController = require('../controllers/geminiController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

router.post('/generate-article', geminiController.generateArticle);
router.get('/article-versions/:ideaId', geminiController.getArticleVersions);
router.post('/select-version', geminiController.selectArticleVersion);

module.exports = router;

