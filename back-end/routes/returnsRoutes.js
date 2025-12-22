import express from 'express';
import { ReturnsController } from '../controllers/ReturnsController.js';

const router = express.Router();
const returnsController = new ReturnsController();

/**
 * Returns Routes
 * All routes are prefixed with /api/returns
 */

// Get return summary for quick action card
router.get('/user/:userId/summary', (req, res, next) => 
  returnsController.getReturnSummary(req, res, next)
);

// Get user returns (with optional filter query param)
router.get('/user/:userId', (req, res, next) => 
  returnsController.getUserReturns(req, res, next)
);

// Get return by ID
router.get('/:returnId', (req, res, next) => 
  returnsController.getReturnById(req, res, next)
);

// Create return request
router.post('/', (req, res, next) => 
  returnsController.createReturn(req, res, next)
);

// Cancel return
router.post('/:returnId/cancel', (req, res, next) => 
  returnsController.cancelReturn(req, res, next)
);

// Seller actions (approve, reject, mark received)
router.post('/:returnId/approve', (req, res, next) => 
  returnsController.approveReturn(req, res, next)
);

router.post('/:returnId/reject', (req, res, next) => 
  returnsController.rejectReturn(req, res, next)
);

router.post('/:returnId/received', (req, res, next) => 
  returnsController.markItemReceived(req, res, next)
);

export default router;

