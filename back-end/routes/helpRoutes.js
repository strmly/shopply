import express from 'express';
import { HelpController } from '../controllers/HelpController.js';

const router = express.Router();
const helpController = new HelpController();

router.get('/categories', (req, res) => helpController.getCategories(req, res));
router.get('/categories/:categoryId/articles', (req, res) =>
  helpController.getArticlesByCategory(req, res)
);
router.get('/articles/:articleId', (req, res) =>
  helpController.getArticle(req, res)
);
router.get('/search', (req, res) => helpController.searchArticles(req, res));
router.get('/faqs', (req, res) => helpController.getFaqs(req, res));

export default router;


