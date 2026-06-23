const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { verifyToken: authMiddleware } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validate.middleware');
const authSchemas = require('../schemas/auth.schema');

router.post('/register', validate(authSchemas.registerSchema), authController.register);
router.post('/login', validate(authSchemas.loginSchema), authController.login);
router.get('/me', authMiddleware, authController.getMe);

module.exports = router;
