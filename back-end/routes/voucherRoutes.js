import express from 'express';
import { VoucherController } from '../controllers/VoucherController.js';

const router = express.Router();
const voucherController = new VoucherController();

/**
 * @route   GET /api/vouchers
 * @desc    Get user's vouchers
 * @access  Public (in production, should be protected)
 */
router.get('/', (req, res, next) => voucherController.getUserVouchers(req, res, next));

/**
 * @route   GET /api/vouchers/active
 * @desc    Get active vouchers
 * @access  Public
 */
router.get('/active', (req, res, next) => voucherController.getActiveVouchers(req, res, next));

/**
 * @route   GET /api/vouchers/summary
 * @desc    Get voucher summary
 * @access  Public
 */
router.get('/summary', (req, res, next) => voucherController.getVoucherSummary(req, res, next));

/**
 * @route   GET /api/vouchers/:id
 * @desc    Get voucher by ID
 * @access  Public
 */
router.get('/:id', (req, res, next) => voucherController.getVoucherById(req, res, next));

/**
 * @route   POST /api/vouchers
 * @desc    Create voucher
 * @access  Public (in production, should be admin only)
 */
router.post('/', (req, res, next) => voucherController.createVoucher(req, res, next));

/**
 * @route   POST /api/vouchers/apply
 * @desc    Apply voucher to cart (validate)
 * @access  Public
 */
router.post('/apply', (req, res, next) => voucherController.applyVoucher(req, res, next));

/**
 * @route   POST /api/vouchers/use
 * @desc    Use voucher (mark as used)
 * @access  Public
 */
router.post('/use', (req, res, next) => voucherController.useVoucher(req, res, next));

export default router;

