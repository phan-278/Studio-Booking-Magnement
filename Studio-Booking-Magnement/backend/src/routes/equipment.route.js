const express = require('express');
const router = express.Router();
const equipmentController = require('../controllers/equipment.controller');
const { authMiddleware, adminMiddleware } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const equipmentSchemas = require('../schemas/equipment.schema');

// Public routes
router.get('/', equipmentController.getEquipments);

// Admin routes
router.post('/', authMiddleware, adminMiddleware, validate(equipmentSchemas.createEquipmentSchema), equipmentController.createEquipment);
router.put('/:id', authMiddleware, adminMiddleware, validate(equipmentSchemas.updateEquipmentSchema), equipmentController.updateEquipment);
router.delete('/:id', authMiddleware, adminMiddleware, validate(equipmentSchemas.equipmentIdParamSchema), equipmentController.deleteEquipment);

module.exports = router;
