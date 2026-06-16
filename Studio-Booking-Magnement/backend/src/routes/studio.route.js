const express = require('express');
const router = express.Router();
const studioController = require('../controllers/studio.controller');
const { validate } = require('../middlewares/validate.middleware');
const { verifyToken } = require('../middlewares/auth.middleware');
const { requireAdmin } = require('../middlewares/role.middleware');
const schemas = require('../utils/studio.schema');

// Tùy chọn truyền user (nếu có) để phân biệt Admin/User ở hàm getStudios
const attachUser = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    try {
      req.user = require('jsonwebtoken').verify(token, process.env.SUPABASE_JWT_SECRET);
    } catch(e) {}
  }
  next();
};

// Public
router.get('/', attachUser, studioController.getStudios);
router.get('/:id', validate(schemas.studioIdParamSchema), studioController.getStudioById);
router.get('/:id/availability', validate(schemas.checkStudioAvailabilitySchema), studioController.checkAvailability);

// Admin
router.post('/', verifyToken, requireAdmin, validate(schemas.createStudioSchema), studioController.createStudio);
router.put('/:id', verifyToken, requireAdmin, validate({ params: schemas.studioIdParamSchema.params, body: schemas.createStudioSchema.body }), studioController.updateStudio);
router.delete('/:id', verifyToken, requireAdmin, validate(schemas.studioIdParamSchema), studioController.deleteStudio);

module.exports = router;
