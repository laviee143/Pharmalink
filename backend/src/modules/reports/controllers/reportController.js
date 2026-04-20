const reportService = require('../services/reportService');
const { validateRequest } = require('../validators/reportValidators');
const { asyncHandler } = require('../../utils/helpers');
const { successResponse, errorResponse } = require('../../utils/response');

/**
 * @desc    Get sales report
 * @route   GET /api/reports/sales
 * @access  Private
 */
const getSalesReport = asyncHandler(async (req, res) => {
  const { startDate, endDate, period = 'month', userId, userRole } = req.query;

  const report = await reportService.getSalesReport({
    startDate,
    endDate,
    period,
    userId,
    userRole
  });

  return successResponse(res, report, 'Sales report generated successfully');
});

/**
 * @desc    Get inventory report
 * @route   GET /api/reports/inventory
 * @access  Private
 */
const getInventoryReport = asyncHandler(async (req, res) => {
  const { userId, includeExpiring, includeLowStock } = req.query;

  const report = await reportService.getInventoryReport({
    userId,
    includeExpiring: includeExpiring === 'true',
    includeLowStock: includeLowStock === 'true'
  });

  return successResponse(res, report, 'Inventory report generated successfully');
});

/**
 * @desc    Get financial report
 * @route   GET /api/reports/financial
 * @access  Private/Admin
 */
const getFinancialReport = asyncHandler(async (req, res) => {
  const { startDate, endDate, period = 'month' } = req.query;

  const report = await reportService.getFinancialReport({
    startDate,
    endDate,
    period
  });

  return successResponse(res, report, 'Financial report generated successfully');
});

/**
 * @desc    Get user activity report
 * @route   GET /api/reports/user-activity
 * @access  Private/Admin
 */
const getUserActivityReport = asyncHandler(async (req, res) => {
  const { startDate, endDate, userId } = req.query;

  const report = await reportService.getUserActivityReport({
    startDate,
    endDate,
    userId
  });

  return successResponse(res, report, 'User activity report generated successfully');
});

/**
 * @desc    Get order analytics
 * @route   GET /api/reports/order-analytics
 * @access  Private
 */
const getOrderAnalytics = asyncHandler(async (req, res) => {
  const { startDate, endDate, period = 'month', userId, userRole } = req.query;

  const analytics = await reportService.getOrderAnalytics({
    startDate,
    endDate,
    period,
    userId,
    userRole
  });

  return successResponse(res, analytics, 'Order analytics generated successfully');
});

/**
 * @desc    Get medicine performance report
 * @route   GET /api/reports/medicine-performance
 * @access  Private
 */
const getMedicinePerformanceReport = asyncHandler(async (req, res) => {
  const { startDate, endDate, userId, userRole } = req.query;

  const report = await reportService.getMedicinePerformanceReport({
    startDate,
    endDate,
    userId,
    userRole
  });

  return successResponse(res, report, 'Medicine performance report generated successfully');
});

/**
 * @desc    Get dashboard summary
 * @route   GET /api/reports/dashboard
 * @access  Private
 */
const getDashboardSummary = asyncHandler(async (req, res) => {
  const { userId, userRole } = req.query;

  const summary = await reportService.getDashboardSummary({
    userId,
    userRole
  });

  return successResponse(res, summary, 'Dashboard summary generated successfully');
});

/**
 * @desc    Export report to CSV
 * @route   POST /api/reports/export
 * @access  Private
 */
const exportReport = asyncHandler(async (req, res) => {
  const { reportType, filters, format = 'csv' } = req.body;

  const reportData = await reportService.exportReport({
    reportType,
    filters,
    format,
    userId: req.user.id,
    userRole: req.user.role
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${reportType}-report.csv"`);
  res.send(reportData);
});

module.exports = {
  getSalesReport,
  getInventoryReport,
  getFinancialReport,
  getUserActivityReport,
  getOrderAnalytics,
  getMedicinePerformanceReport,
  getDashboardSummary,
  exportReport
};
