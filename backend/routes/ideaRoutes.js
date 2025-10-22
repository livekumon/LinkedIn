const express = require('express');
const router = express.Router();
const ideaController = require('../controllers/ideaController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// Stats route
router.get('/stats', ideaController.getIdeasStats);

// Favorites route
router.get('/favorites', ideaController.getFavoriteIdeas);

// Recycle bin routes
router.get('/deleted/all', ideaController.getDeletedIdeas);
router.put('/deleted/:id/restore', ideaController.restoreIdea);
router.delete('/deleted/:id/permanent', ideaController.permanentDeleteIdea);

// CRUD routes
router.post('/', ideaController.createIdea);
router.get('/', ideaController.getAllIdeas);
router.get('/:id', ideaController.getIdeaById);
router.put('/:id', ideaController.updateIdea);
router.delete('/:id', ideaController.deleteIdea);

module.exports = router;

