import express from 'express';
import { PromotionController } from '../controllers/PromotionController.js';

const router = express.Router();
const promotionController = new PromotionController();

/**
 * Promotion Routes
 * All routes are prefixed with /sellers/:storeId/promotions
 */

// Get promotion statistics
router.get('/:storeId/promotions/stats', (req, res, next) => 
  promotionController.getPromotionStats(req, res, next)
);

// Get promotions for calendar view
router.get('/:storeId/promotions/calendar', (req, res, next) => 
  promotionController.getPromotionsForCalendar(req, res, next)
);

// Check for conflicts
router.post('/:storeId/promotions/check-conflicts', (req, res, next) => 
  promotionController.checkConflicts(req, res, next)
);

// Get all promotions for a store
router.get('/:storeId/promotions', (req, res, next) => 
  promotionController.getPromotions(req, res, next)
);

// Create new promotion
router.post('/:storeId/promotions', (req, res, next) => 
  promotionController.createPromotion(req, res, next)
);

// Get promotion by ID
router.get('/:storeId/promotions/:id', (req, res, next) => 
  promotionController.getPromotionById(req, res, next)
);

// Update promotion
router.patch('/:storeId/promotions/:id', (req, res, next) => 
  promotionController.updatePromotion(req, res, next)
);

// Delete promotion
router.delete('/:storeId/promotions/:id', (req, res, next) => 
  promotionController.deletePromotion(req, res, next)
);

// Pause promotion
router.post('/:storeId/promotions/:id/pause', (req, res, next) => 
  promotionController.pausePromotion(req, res, next)
);

// Resume promotion
router.post('/:storeId/promotions/:id/resume', (req, res, next) => 
  promotionController.resumePromotion(req, res, next)
);

// End promotion
router.post('/:storeId/promotions/:id/end', (req, res, next) => 
  promotionController.endPromotion(req, res, next)
);

// Duplicate promotion
router.post('/:storeId/promotions/:id/duplicate', (req, res, next) => 
  promotionController.duplicatePromotion(req, res, next)
);

export default router;

