const express = require('express');
const router = express.Router();
const equipmentController = require('../controllers/equipment.controller');
const { authMiddleware, adminMiddleware } = require('../middlewares/auth.middleware');

// Public routes
router.get('/', equipmentController.getEquipments);

// Admin routes
router.post('/', authMiddleware, adminMiddleware, equipmentController.createEquipment);
router.put('/:id', authMiddleware, adminMiddleware, equipmentController.updateEquipment);
router.delete('/:id', authMiddleware, adminMiddleware, equipmentController.deleteEquipment);

module.exports = router;
