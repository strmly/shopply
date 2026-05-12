/**
 * WhatsApp Business API Configuration
 * Supports both Cloud API and BSP providers
 */

export const whatsappConfig = {
  // WhatsApp Business API Type: 'cloud' or 'bsp'
  apiType: process.env.WHATSAPP_API_TYPE || 'cloud',
  
  // Cloud API Configuration
  cloudApi: {
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
    businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID,
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
    apiVersion: process.env.WHATSAPP_API_VERSION || 'v18.0',
    baseUrl: 'https://graph.facebook.com',
  },

  // Webhook Configuration
  webhook: {
    verifyToken: process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || 'tsenga_verify_token_2024',
    secret: process.env.WHATSAPP_WEBHOOK_SECRET,
  },

  // Session Configuration
  session: {
    ttl: parseInt(process.env.WHATSAPP_SESSION_TTL) || 1800, // 30 minutes
    persistentTtl: parseInt(process.env.WHATSAPP_PERSISTENT_TTL) || 86400 * 7, // 7 days
  },

  // Rate Limiting
  rateLimits: {
    messagesPerMinute: 60,
    messagesPerDay: 1000,
    searchPerHour: 100,
  },

  // Message Templates (pre-approved by WhatsApp)
  templates: {
    otp: 'tsenga_otp',
    orderConfirmation: 'tsenga_order_confirmed',
    orderPaid: 'tsenga_order_paid',
    orderPreparing: 'tsenga_order_preparing',
    orderReady: 'tsenga_order_ready',
    courierAssigned: 'tsenga_courier_assigned',
    outForDelivery: 'tsenga_out_for_delivery',
    delivered: 'tsenga_delivered',
    refundApproved: 'tsenga_refund_approved',
    refundPaid: 'tsenga_refund_paid',
    lowStock: 'tsenga_low_stock_alert',
    promoStarting: 'tsenga_promo_starting',
  },

  // Conversation Settings
  conversation: {
    maxBackStackSize: 5,
    idleTimeout: 900, // 15 minutes
    defaultRadius: 'auto',
    maxSearchResults: 10,
    maxProductsInMessage: 10,
  },

  // Security
  security: {
    requireOtpForPayment: true,
    requireOtpForSensitiveChanges: true,
    maxFailedAttempts: 3,
    otpExpiry: 300, // 5 minutes
    otpLength: 6,
  },

  // Features
  features: {
    whatsappFlows: process.env.WHATSAPP_FLOWS_ENABLED === 'true',
    interactiveMessages: true,
    mediaMessages: true,
    locationSharing: true,
    paymentLinks: true,
  },
};

export default whatsappConfig;

