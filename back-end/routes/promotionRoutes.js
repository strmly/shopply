import express from 'express';
import { PromotionController } from '../controllers/PromotionController.js';
import { authorize } from '../middleware/auth.js';

const router = express.Router();
const promotionController = new PromotionController();
const sellerAuth = authorize('seller', 'admin');

router.get('/:storeId/promotions/stats', sellerAuth, (req, res, next) => promotionController.getPromotionStats(req, res, next));
router.get('/:storeId/promotions/calendar', sellerAuth, (req, res, next) => promotionController.getPromotionsForCalendar(req, res, next));
router.post('/:storeId/promotions/check-conflicts', sellerAuth, (req, res, next) => promotionController.checkConflicts(req, res, next));
router.get('/:storeId/promotions', sellerAuth, (req, res, next) => promotionController.getPromotions(req, res, next));
router.post('/:storeId/promotions', sellerAuth, (req, res, next) => promotionController.createPromotion(req, res, next));
router.get('/:storeId/promotions/:id', sellerAuth, (req, res, next) => promotionController.getPromotionById(req, res, next));
router.patch('/:storeId/promotions/:id', sellerAuth, (req, res, next) => promotionController.updatePromotion(req, res, next));
router.delete('/:storeId/promotions/:id', sellerAuth, (req, res, next) => promotionController.deletePromotion(req, res, next));
router.post('/:storeId/promotions/:id/pause', sellerAuth, (req, res, next) => promotionController.pausePromotion(req, res, next));
router.post('/:storeId/promotions/:id/resume', sellerAuth, (req, res, next) => promotionController.resumePromotion(req, res, next));
router.post('/:storeId/promotions/:id/end', sellerAuth, (req, res, next) => promotionController.endPromotion(req, res, next));
router.post('/:storeId/promotions/:id/duplicate', sellerAuth, (req, res, next) => promotionController.duplicatePromotion(req, res, next));

export default router;
