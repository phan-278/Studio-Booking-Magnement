const express = require('express');
const router = express.Router();
const studioController = require('../controllers/studio.controller');
const { authMiddleware, adminMiddleware } = require('../middlewares/auth.middleware');

// Public routes
router.get('/', studioController.getStudios);
router.get('/:id', studioController.getStudioById);

// Admin routes
router.post('/', authMiddleware, adminMiddleware, studioController.createStudio);
router.put('/:id', authMiddleware, adminMiddleware, studioController.updateStudio);
router.delete('/:id', authMiddleware, adminMiddleware, studioController.deleteStudio);

module.exports = router;
