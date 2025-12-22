import { sendSuccess } from '../utils/response.js';

const HELP_CATEGORIES = [
  { id: 'orders', title: 'Orders & Delivery', description: 'Track, change, and receive your orders.' },
  { id: 'payments', title: 'Payments & Refunds', description: 'Billing, refunds, and payment methods.' },
  { id: 'account', title: 'Account & Security', description: 'Profile, password, and account safety.' },
  { id: 'sellers', title: 'Sellers & Stores', description: 'Selling on Shopply and store management.' },
  { id: 'technical', title: 'Technical Issues', description: 'App performance, bugs, and errors.' },
];

// Simple in-memory help articles
const HELP_ARTICLES = [
  {
    id: 'order-tracking',
    categoryId: 'orders',
    title: 'How do I track my order?',
    summary: 'See where your order is in just a few taps.',
    content: [
      'You can track your order from the Orders tab in your profile.',
      'Each order shows a live status, delivery ETA, and courier details when available.',
      'If something looks wrong, you can report an issue directly from the tracking screen.',
    ],
  },
  {
    id: 'delivery-times',
    categoryId: 'orders',
    title: 'How long does delivery take?',
    summary: 'Typical delivery timelines for your area.',
    content: [
      'Most orders are delivered within 2–5 business days, depending on your location and the seller.',
      'You\'ll see an estimated delivery window at checkout and in your order details.',
      'Public holidays and peak seasons can affect delivery times slightly.',
    ],
  },
  {
    id: 'refunds',
    categoryId: 'payments',
    title: 'How do refunds work?',
    summary: 'When and how you\'ll receive your money back.',
    content: [
      'Once your return is approved, refunds are usually processed within 3–7 business days.',
      'Refunds are sent back to your original payment method where possible.',
      'You\'ll receive a notification as soon as your refund is initiated.',
    ],
  },
  {
    id: 'change-address',
    categoryId: 'account',
    title: 'How do I change my address?',
    summary: 'Update your delivery details in a few steps.',
    content: [
      'Go to Profile → Addresses to add, edit, or remove saved addresses.',
      'You can set a default address for faster checkout.',
      'Changes apply to new orders only; existing orders keep their original address.',
    ],
  },
];

const FAQ_ITEMS = [
  {
    id: 'faq-refunds',
    question: 'How do refunds work?',
    answer:
      'Once your return is approved, refunds are usually processed within 3–7 business days and sent back to your original payment method where possible.',
  },
  {
    id: 'faq-delivery-time',
    question: 'How long does delivery take?',
    answer:
      'Most orders arrive within 2–5 business days depending on your location, seller, and delivery option selected at checkout.',
  },
  {
    id: 'faq-change-address',
    question: 'How do I change my address?',
    answer:
      'Go to Profile → Addresses to add, edit, or remove saved addresses. New addresses apply to future orders.',
  },
];

export class HelpController {
  getCategories(req, res) {
    return sendSuccess(res, HELP_CATEGORIES, 'Help categories loaded');
  }

  getArticlesByCategory(req, res) {
    const { categoryId } = req.params;
    const articles = HELP_ARTICLES.filter(a => a.categoryId === categoryId);
    return sendSuccess(res, articles, 'Help articles loaded');
  }

  getArticle(req, res) {
    const { articleId } = req.params;
    const article = HELP_ARTICLES.find(a => a.id === articleId);
    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found',
      });
    }
    return sendSuccess(res, article, 'Help article loaded');
  }

  searchArticles(req, res) {
    const { q } = req.query;
    const query = (q || '').toString().toLowerCase().trim();
    if (!query) {
      return sendSuccess(res, [], 'No search query provided');
    }

    const results = HELP_ARTICLES.filter(a => {
      const haystack = `${a.title} ${a.summary} ${a.content.join(' ')}`.toLowerCase();
      return haystack.includes(query);
    });

    return sendSuccess(res, results, 'Search results loaded');
  }

  getFaqs(req, res) {
    return sendSuccess(res, FAQ_ITEMS, 'FAQs loaded');
  }
}


