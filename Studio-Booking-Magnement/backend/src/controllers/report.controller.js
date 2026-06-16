const reportService = require('../services/report.service');

exports.getMonthlyReport = async (req, res, next) => {
  try {
    const { year, month } = req.query;
    const report = await reportService.getMonthlyReport(year, month);
    res.json({ success: true, data: report });
  } catch (error) {
    next(error);
  }
};

exports.regenerateMonthlyReport = async (req, res, next) => {
  try {
    const { year, month } = req.params;
    const report = await reportService.regenerateMonthlyReport(year, month);
    res.json({ success: true, data: report });
  } catch (error) {
    next(error);
  }
};

exports.finalizeMonthlyReport = async (req, res, next) => {
  try {
    const { year, month } = req.params;
    const adminId = req.user.id;
    const report = await reportService.finalizeMonthlyReport(year, month, adminId);
    res.json({ success: true, data: report, message: 'Đã khóa sổ kế toán thành công.' });
  } catch (error) {
    next(error);
  }
};
