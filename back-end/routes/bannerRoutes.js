import express from 'express';
import { BannerController } from '../controllers/BannerController.js';

const router = express.Router();

router.get('/', (req, res) => BannerController.getBanners(req, res));
router.post('/:id/impression', (req, res) => BannerController.recordImpression(req, res));
router.post('/:id/click', (req, res) => BannerController.recordClick(req, res));
router.post('/:id/dismiss', (req, res) => BannerController.dismiss(req, res));

export default router;
