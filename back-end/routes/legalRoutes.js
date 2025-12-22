import express from 'express';
import { LegalController } from '../controllers/LegalController.js';

const router = express.Router();
const legalController = new LegalController();

// Get all legal documents (for listing page)
router.get('/', (req, res) => legalController.getAllDocuments(req, res));

// Get specific legal documents
router.get('/terms', (req, res) => legalController.getTerms(req, res));
router.get('/privacy', (req, res) => legalController.getPrivacy(req, res));
router.get('/community-guidelines', (req, res) => legalController.getCommunityGuidelines(req, res));
router.get('/licenses', (req, res) => legalController.getLicenses(req, res));

// Search within legal documents
router.get('/search', (req, res) => legalController.searchDocuments(req, res));

export default router;

