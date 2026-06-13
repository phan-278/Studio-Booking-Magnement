const express = require('express');
const router = express.Router();
const studioController = require('../controllers/studio.controller');
const { authMiddleware, adminMiddleware } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const studioSchemas = require('../schemas/studio.schema');

// Public routes
router.get('/', studioController.getStudios);
router.get('/:id', validate(studioSchemas.studioIdParamSchema), studioController.getStudioById);

// Admin routes
router.post('/', authMiddleware, adminMiddleware, validate(studioSchemas.createStudioSchema), studioController.createStudio);
router.put('/:id', authMiddleware, adminMiddleware, validate(studioSchemas.updateStudioSchema), studioController.updateStudio);
router.delete('/:id', authMiddleware, adminMiddleware, validate(studioSchemas.studioIdParamSchema), studioController.deleteStudio);

module.exports = router;
