const express = require('express');
const router = express.Router();
const equipmentController = require('../controllers/equipment.controller');
const { validate } = require('../middlewares/validate.middleware');
const { verifyToken } = require('../middlewares/auth.middleware');
const { requireAdmin } = require('../middlewares/role.middleware');
const schemas = require('../utils/equipment.schema');

// Public
router.get('/', validate(schemas.equipmentQuerySchema), equipmentController.getEquipments);

// Admin
router.post('/', verifyToken, requireAdmin, validate(schemas.createEquipmentSchema), equipmentController.createEquipment);
router.put('/:id', verifyToken, requireAdmin, validate({ params: schemas.equipmentIdParamSchema.params, body: schemas.createEquipmentSchema.body }), equipmentController.updateEquipment);
router.delete('/:id', verifyToken, requireAdmin, validate(schemas.equipmentIdParamSchema), equipmentController.deleteEquipment);

module.exports = router;
