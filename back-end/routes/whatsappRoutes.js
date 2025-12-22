/**
 * WhatsApp Routes
 * Webhook and API endpoints for WhatsApp integration
 */

import express from 'express';
import WhatsAppController from '../controllers/WhatsAppController.js';

const router = express.Router();

/**
 * @route   GET /api/whatsapp/webhook
 * @desc    WhatsApp webhook verification
 * @access  Public
 */
router.get('/webhook', WhatsAppController.verify.bind(WhatsAppController));

/**
 * @route   POST /api/whatsapp/webhook
 * @desc    WhatsApp webhook handler (receives messages)
 * @access  Public
 */
router.post('/webhook', WhatsAppController.webhook.bind(WhatsAppController));

/**
 * @route   POST /api/whatsapp/send-template
 * @desc    Send template message (admin/testing)
 * @access  Private (should add auth middleware)
 */
router.post('/send-template', WhatsAppController.sendTemplate.bind(WhatsAppController));

/**
 * @route   POST /api/whatsapp/send-message
 * @desc    Send text message (admin/testing)
 * @access  Private (should add auth middleware)
 */
router.post('/send-message', WhatsAppController.sendMessage.bind(WhatsAppController));

/**
 * @route   GET /api/whatsapp/sessions
 * @desc    Get active WhatsApp sessions (admin/debug)
 * @access  Private (should add auth middleware)
 */
router.get('/sessions', WhatsAppController.getActiveSessions.bind(WhatsAppController));

/**
 * @route   GET /api/whatsapp/health
 * @desc    WhatsApp service health check
 * @access  Public
 */
router.get('/health', WhatsAppController.health.bind(WhatsAppController));

export default router;

