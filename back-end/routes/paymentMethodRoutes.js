import express from 'express';
import { PaymentMethodController } from '../controllers/PaymentMethodController.js';

const router = express.Router();
const paymentMethodController = new PaymentMethodController();

/**
 * Payment Method Routes
 */
router.get('/my-payment-methods', (req, res, next) => 
  paymentMethodController.getMyPaymentMethods(req, res, next)
);
router.get('/user/:userId', (req, res, next) => 
  paymentMethodController.getPaymentMethodsByUserId(req, res, next)
);
router.get('/:id', (req, res, next) => 
  paymentMethodController.getPaymentMethodById(req, res, next)
);
router.post('/', (req, res, next) => 
  paymentMethodController.createPaymentMethod(req, res, next)
);
router.post('/validate', (req, res, next) => 
  paymentMethodController.validateCardNumber(req, res, next)
);
router.put('/:id', (req, res, next) => 
  paymentMethodController.updatePaymentMethod(req, res, next)
);
router.put('/:id/set-default', (req, res, next) => 
  paymentMethodController.setDefaultPaymentMethod(req, res, next)
);
router.put('/:id/mark-failed', (req, res, next) => 
  paymentMethodController.markPaymentFailed(req, res, next)
);
router.put('/:id/clear-failed', (req, res, next) => 
  paymentMethodController.clearFailedPayment(req, res, next)
);
router.delete('/:id', (req, res, next) => 
  paymentMethodController.deletePaymentMethod(req, res, next)
);

export default router;

