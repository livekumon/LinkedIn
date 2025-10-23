const express = require('express');
const router = express.Router();
const tagSetController = require('../controllers/tagSetController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// TagSet routes
router.get('/', tagSetController.getAllTagSets);
router.get('/default', tagSetController.getDefaultTagSet);
router.post('/', tagSetController.createTagSet);
router.put('/:id', tagSetController.updateTagSet);
router.put('/:id/set-default', tagSetController.setDefaultTagSet);
router.put('/:id/record-usage', tagSetController.recordUsage);
router.delete('/:id', tagSetController.deleteTagSet);

module.exports = router;



