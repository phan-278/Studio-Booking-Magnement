const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { requireAdmin } = require('../middlewares/role.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { monthlyReportQuerySchema, monthlyReportParamsSchema } = require('../schemas/report.schema');

// Tất cả API báo cáo đều bắt buộc là Admin
router.use(requireAdmin);

router.get(
  '/monthly',
  validate(monthlyReportQuerySchema),
  reportController.getMonthlyReport
);

router.post(
  '/monthly/:year/:month/regenerate',
  validate(monthlyReportParamsSchema),
  reportController.regenerateMonthlyReport
);

router.patch(
  '/monthly/:year/:month/finalize',
  validate(monthlyReportParamsSchema),
  reportController.finalizeMonthlyReport
);

module.exports = router;
