import express from 'express';
import { StorefrontController } from '../controllers/StorefrontController.js';

const router = express.Router();
const storefrontController = new StorefrontController();

router.get('/:storeId', (req, res, next) => storefrontController.getStorefront(req, res, next));

export default router;
