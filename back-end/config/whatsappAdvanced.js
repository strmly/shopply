/**
 * Advanced WhatsApp Configuration
 * Elite-grade settings for production WhatsApp channel
 */

export const whatsappAdvancedConfig = {
  /**
   * Interaction Grades (A/B/C system)
   */
  interactionGrades: {
    A: 'native_whatsapp',      // Buttons, lists, quick replies (default)
    B: 'whatsapp_flows',       // Forms inside WhatsApp (preferred for forms)
    C: 'secure_deep_link',     // Web/App for complex tasks
  },

  /**
   * Progressive Expansion Messaging
   */
  expansionMessaging: {
    enabled: true,
    showProgress: true,
    messages: {
      searching: (radius) => `🔍 Searching within ${radius}...`,
      expanding: (radius) => `⟳ Expanding to ${radius}...`,
      found: (count, radius) => `Found ${count} ${count === 1 ? 'result' : 'results'} within ${radius}`,
      noResults: (radius) => `No results within ${radius}. Expanding...`,
    },
  },

  /**
   * Message Header Pattern (Context on every message)
   */
  messageHeaders: {
    enabled: true,
    format: '📍 {address} • {radius_mode} ({current_radius})',
    showOnEveryMessage: false, // Only on major state changes
    showOnHomeAndSearch: true,
  },

  /**
   * Session Management (Enhanced)
   */
  sessionManagement: {
    shortSession: {
      ttl: 900, // 15 minutes for sensitive flows
      triggers: ['checkout', 'payment', 'bank_details', 'kyc'],
    },
    longSession: {
      ttl: 1800, // 30 minutes for normal flows
    },
    persistentPreferences: {
      ttl: 2592000, // 30 days
      keys: ['address', 'radius_mode', 'payment_method_token', 'role'],
    },
  },

  /**
   * Step-up Security Requirements
   */
  stepUpAuth: {
    enabled: true,
    triggers: [
      'payment_method_change',
      'bank_info_change',
      'password_change',
      'large_refund', // > R1000
      'kyc_update',
      'seller_payout',
    ],
    method: 'otp', // or 'secure_link'
    otpExpiry: 300, // 5 minutes
  },

  /**
   * Idempotency & Replay Protection (Enhanced)
   */
  idempotency: {
    messageIdTtl: 86400, // 24 hours
    criticalOperations: [
      'add_to_cart',
      'create_order',
      'process_payment',
      'refund_request',
      'mark_order_ready',
      'create_product',
      'update_inventory',
    ],
    keyFormat: 'idempotent:{operation}:{user_id}:{unique_id}',
  },

  /**
   * Dead Letter Queue
   */
  deadLetterQueue: {
    enabled: true,
    maxRetries: 3,
    retryDelays: [1000, 5000, 15000], // exponential backoff
    queueName: 'whatsapp_dlq',
  },

  /**
   * Navigation Primitives (Always Available)
   */
  globalNavigation: {
    commands: {
      home: ['home', '🏠', 'main', 'menu'],
      search: ['search', '🔍', 'find', 'look'],
      cart: ['cart', '🛒', 'basket', 'my cart'],
      orders: ['orders', '📦', 'my orders', 'track'],
      help: ['help', '❓', '?', 'support'],
      seller: ['seller', '🏪', 'sell', 'business'],
      buyer: ['buyer', '🛍️', 'shop', 'buy'],
    },
    alwaysShowButtons: true,
    maxButtonsPerMessage: 3,
  },

  /**
   * Result Bundle Display
   */
  resultDisplay: {
    defaultPageSize: 5,
    maxPageSize: 10,
    showMoreButton: true,
    showFilterButton: true,
    showChangeRadiusButton: true,
  },

  /**
   * Object Card Format (Products, Orders, Stores)
   */
  cardFormat: {
    maxImageSize: 500, // KB
    imageQuality: 80,
    showBadges: true,
    showDistance: true,
    showRating: true,
    showStock: true,
    maxButtons: 3,
  },

  /**
   * WhatsApp Flows Integration
   */
  flows: {
    enabled: process.env.WHATSAPP_FLOWS_ENABLED === 'true',
    useCases: [
      'address_setup',
      'checkout_selection',
      'kyc_upload',
      'bank_details',
      'product_creation',
      'product_edit',
      'returns_request',
    ],
    flowIds: {
      addressSetup: process.env.FLOW_ID_ADDRESS_SETUP,
      kycUpload: process.env.FLOW_ID_KYC,
      productCreation: process.env.FLOW_ID_PRODUCT_CREATE,
      returnsRequest: process.env.FLOW_ID_RETURNS,
    },
  },

  /**
   * Secure Deep Links (for complex tasks)
   */
  deepLinks: {
    tokenExpiry: 900, // 15 minutes
    algorithm: 'HS256',
    useCases: [
      'payment_completion',
      'advanced_product_edit',
      'analytics_charts',
      'complex_reports',
    ],
    baseUrl: process.env.APP_URL || 'https://shopply.app',
  },

  /**
   * Quality & Abuse Controls
   */
  qualityControls: {
    maxSearchesPerHour: 50,
    maxCartAddsPerMinute: 10,
    spamDetection: {
      enabled: true,
      threshold: 20, // messages per minute
      blockDuration: 300, // 5 minutes
    },
    sellerBroadcastLimit: {
      enabled: true,
      maxRecipientsPerDay: 100,
    },
  },

  /**
   * Hyperlocal Quality Requirements
   */
  hyperlocalQuality: {
    alwaysShowDistance: true,
    alwaysShowSellerRating: true,
    showTopRatedBadge: true,
    showETA: true,
    showInStock: true,
    distanceFormat: 'metric', // metric or imperial
  },

  /**
   * Notification Templates (Enhanced)
   */
  enhancedTemplates: {
    buyer: {
      otp: 'shopply_otp_v2',
      orderConfirmed: 'shopply_order_confirmed_v2',
      orderPreparing: 'shopply_order_preparing_v2',
      courierAssigned: 'shopply_courier_assigned_v2',
      outForDelivery: 'shopply_out_for_delivery_v2',
      delivered: 'shopply_delivered_v2',
      refundInitiated: 'shopply_refund_initiated',
      refundApproved: 'shopply_refund_approved_v2',
    },
    seller: {
      newOrder: 'shopply_seller_new_order',
      orderOverdue: 'shopply_seller_order_overdue',
      lowStock: 'shopply_seller_low_stock_v2',
      payoutProcessed: 'shopply_seller_payout',
    },
  },

  /**
   * Analytics & Observability
   */
  observability: {
    trackConversions: true,
    trackExpansionTiers: true,
    trackDropOffPoints: true,
    trackTimeToAction: true,
    metrics: [
      'onboarding_completion_rate',
      'location_set_rate',
      'search_expansion_distribution',
      'add_to_cart_rate',
      'checkout_link_ctr',
      'payment_completion_rate',
      'order_completion_rate',
      'seller_time_to_ready',
      'support_escalation_rate',
    ],
  },

  /**
   * Error & Empty States
   */
  emptyStates: {
    noResults: {
      message: '😔 No results found. Try:\n• Expanding your radius\n• Browsing categories\n• Checking spelling',
      actions: ['expand_radius', 'browse_categories', 'try_again'],
    },
    outOfStock: {
      message: '❌ This item is currently out of stock.\nWould you like to be notified when it\'s back?',
      actions: ['notify_me', 'similar_products', 'back'],
    },
    paymentFailed: {
      message: '⚠️ Payment failed. Please try again or use a different method.',
      actions: ['retry_payment', 'change_method', 'contact_support'],
    },
    offline: {
      message: '📡 Couldn\'t connect. Please check your connection and try again.',
      actions: ['retry', 'help'],
    },
  },

  /**
   * Copy Style Guidelines
   */
  copyStyle: {
    tone: 'friendly_professional',
    maxMessageLength: 1024,
    useEmojis: true,
    useLocalTerms: true,
    alwaysActionable: true,
    patterns: {
      greeting: '👋',
      success: '✅',
      error: '❌',
      warning: '⚠️',
      loading: '⏳',
      location: '📍',
      money: '💰',
      cart: '🛒',
      orders: '📦',
      seller: '🏪',
    },
  },

  /**
   * Human Handoff
   */
  humanHandoff: {
    enabled: true,
    triggers: [
      'user_types_agent',
      'repeated_errors',
      'payment_dispute',
      'refund_request',
      'complaint',
    ],
    transferContext: true,
    maxWaitTime: 300, // 5 minutes before fallback
    fallbackMessage: 'Our team will respond within 2 hours. You\'ll get a WhatsApp message when we reply.',
  },

  /**
   * Channel Response Schema
   */
  channelResponse: {
    format: 'structured',
    includeSessionState: true,
    includeNextActions: true,
    maxMessagesPerBatch: 5,
  },
};

export default whatsappAdvancedConfig;

