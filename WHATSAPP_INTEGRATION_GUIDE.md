# WhatsApp Integration Guide for Shopply

## 🎯 Overview

This guide explains how to set up and use the WhatsApp channel integration for Shopply. The WhatsApp integration allows buyers and sellers to interact with the platform entirely through WhatsApp messages.

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Prerequisites](#prerequisites)
3. [Setup Instructions](#setup-instructions)
4. [WhatsApp Business API Setup](#whatsapp-business-api-setup)
5. [Testing](#testing)
6. [Buyer Flows](#buyer-flows)
7. [Seller Flows](#seller-flows)
8. [Troubleshooting](#troubleshooting)

---

## 🏗️ Architecture Overview

### Components

1. **WhatsApp Gateway** (`WhatsAppGateway.js`)
   - Handles all WhatsApp Business API communication
   - Normalizes webhook payloads into internal events
   - Sends messages via WhatsApp (text, buttons, lists, templates)

2. **Session Service** (`WhatsAppSessionService.js`)
   - Manages conversation state in Redis
   - Links WhatsApp numbers to user accounts
   - Handles idempotency for message processing

3. **Conversation Orchestrator** (`WhatsAppOrchestrator.js`)
   - Routes messages to appropriate skills
   - Handles global commands (home, search, cart, etc.)
   - Manages conversation flow

4. **Skills** (in `services/skills/`)
   - **OnboardingSkill**: New user onboarding and location setup
   - **BuyerHomeSkill**: Buyer dashboard and navigation
   - **SearchSkill**: Product search with H3 hyperlocal expansion
   - **CartSkill**: Shopping cart management
   - **CheckoutSkill**: Checkout and payment links
   - **OrdersSkill**: Order tracking and management
   - **SellerHomeSkill**: Seller dashboard
   - **SellerOrdersSkill**: Seller order management
   - **SellerProductsSkill**: Product management for sellers
   - **HelpSkill**: Help and support

5. **Message Renderer** (`WhatsAppMessageRenderer.js`)
   - Formats responses into WhatsApp message types
   - Handles product cards, order summaries, etc.

6. **Notification Service** (`WhatsAppNotificationService.js`)
   - Sends template-based notifications
   - Order status updates, OTPs, promotions

---

## 🔧 Prerequisites

### 1. WhatsApp Business Account

You need a **Meta Business Account** with **WhatsApp Business API** access:

- **Option A: Cloud API (Recommended for quick start)**
  - Free tier available
  - Hosted by Meta
  - Easy setup via Meta Business Suite

- **Option B: Business Solution Provider (BSP)**
  - For higher volumes
  - More control and features
  - Examples: Twilio, MessageBird, Vonage

### 2. Redis

Redis is required for session management:

```bash
# macOS
brew install redis
brew services start redis

# Ubuntu/Debian
sudo apt install redis-server
sudo systemctl start redis

# Docker
docker run -d -p 6379:6379 redis:alpine
```

### 3. Node.js Dependencies

Already included in `package.json`:
- `ioredis` - Redis client
- `axios` - HTTP requests
- `uuid` - Unique IDs

---

## 🚀 Setup Instructions

### Step 1: Install Dependencies

```bash
cd back-end
npm install
```

### Step 2: Configure Environment

Copy `.env.example` to `.env` and update:

```bash
cp .env.example .env
```

Key configurations:

```env
# WhatsApp Business API
WHATSAPP_API_TYPE=cloud
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id
WHATSAPP_ACCESS_TOKEN=your_access_token

# Webhook
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_secret_verify_token
WHATSAPP_WEBHOOK_SECRET=your_webhook_secret

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
```

### Step 3: Start Services

```bash
# Start Redis (if not already running)
redis-server

# Start the backend
npm run dev
```

The server will start on `http://localhost:5000` with WhatsApp endpoints:
- `GET /api/whatsapp/webhook` - Webhook verification
- `POST /api/whatsapp/webhook` - Webhook handler
- `GET /api/whatsapp/health` - Health check

---

## 📱 WhatsApp Business API Setup

### Using Cloud API (Recommended for Development)

1. **Go to Meta for Developers**
   - Visit: https://developers.facebook.com/
   - Create or select your app

2. **Add WhatsApp Product**
   - In your app dashboard, click "Add Product"
   - Select "WhatsApp" and click "Set Up"

3. **Get Credentials**
   - **Phone Number ID**: Found in WhatsApp > API Setup
   - **Business Account ID**: Found in WhatsApp > API Setup
   - **Access Token**: Generated in WhatsApp > API Setup (temporary) or create a permanent token

4. **Configure Webhook**
   - Go to WhatsApp > Configuration
   - Click "Edit" next to Webhook
   - **Callback URL**: `https://your-domain.com/api/whatsapp/webhook`
   - **Verify Token**: Same as `WHATSAPP_WEBHOOK_VERIFY_TOKEN` in `.env`
   - Subscribe to: `messages`

5. **Test Number (Development)**
   - Add test phone numbers in WhatsApp > API Setup
   - Send a test message

### Webhook Setup with ngrok (for local development)

```bash
# Install ngrok
npm install -g ngrok

# Start ngrok tunnel
ngrok http 5000

# Use the HTTPS URL as your webhook URL
# Example: https://abc123.ngrok.io/api/whatsapp/webhook
```

---

## 🧪 Testing

### Test Webhook Verification

```bash
curl "http://localhost:5000/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=shopply_verify_token_2024&hub.challenge=test123"
```

Should return: `test123`

### Send Test Message (Admin Endpoint)

```bash
curl -X POST http://localhost:5000/api/whatsapp/send-message \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+27123456789",
    "text": "Hello from Shopply! 👋"
  }'
```

### Check Active Sessions

```bash
curl http://localhost:5000/api/whatsapp/sessions
```

### Health Check

```bash
curl http://localhost:5000/api/whatsapp/health
```

---

## 🛍️ Buyer Flows

### Onboarding Flow

1. User sends first message
2. Bot sends welcome message
3. Request location (share location or enter address)
4. Confirm location
5. Select search radius (Auto recommended)
6. Complete → Go to Home

### Search Flow

**Text Commands:**
- `search [query]` - Search for products
- `search` - Open search menu

**Example:**
```
User: search braai tongs
Bot: 🔍 Searching within 1km...
     Found 6 options within 10km (closest available).
     [List of products with prices and distances]
```

### Shopping Flow

1. **Search** → Select product
2. **Add to Cart** or **Buy Now**
3. **View Cart** → Edit quantities
4. **Checkout** → Confirm address
5. **Payment Link** → Complete payment
6. **Order Tracking** → Status updates

### Quick Commands

- `home` - Go to home
- `search` - Search products
- `cart` - View cart
- `orders` - Track orders
- `help` - Get help

---

## 🏪 Seller Flows

### Switch to Seller Mode

```
User: seller
Bot: 🏪 Seller Dashboard
     Today's Sales: R1,234.50
     Pending Orders: 3
     [Orders] [Products] [Analytics]
```

### Manage Orders

1. Type `seller` to enter seller mode
2. Select **Orders**
3. Choose an order
4. Actions:
   - Mark as Preparing
   - Mark as Ready
   - Contact Customer

### Manage Products

1. Seller Mode → **Products**
2. **Add Product**:
   - Name
   - Price
   - Stock
3. **Edit Product**:
   - Update Stock
   - Update Price
   - Delete

### Quick Seller Commands

- `seller` - Enter seller mode
- `buyer` - Switch to buyer mode

---

## 🔔 Notifications

Template notifications are sent automatically for:

- **Order Confirmed** - When order is placed
- **Payment Received** - When payment completes
- **Order Preparing** - When seller starts preparing
- **Order Ready** - When order is ready for pickup
- **Courier Assigned** - When courier is assigned
- **Out for Delivery** - When courier is en route
- **Delivered** - When order is delivered
- **Refund Approved/Paid** - Refund status updates
- **Low Stock Alert** - For sellers when stock is low

---

## 🐛 Troubleshooting

### Messages Not Being Received

1. **Check Webhook Configuration**
   ```bash
   curl http://localhost:5000/api/whatsapp/health
   ```

2. **Verify Webhook URL** in Meta dashboard
   - Must be HTTPS in production
   - Use ngrok for local testing

3. **Check Logs**
   - Backend logs show incoming webhook payloads
   - Look for "📨 WhatsApp webhook received"

### Session Issues

1. **Check Redis Connection**
   ```bash
   redis-cli ping
   # Should return: PONG
   ```

2. **View Active Sessions**
   ```bash
   curl http://localhost:5000/api/whatsapp/sessions
   ```

3. **Clear Session** (if stuck)
   ```bash
   redis-cli
   > KEYS whatsapp:session:*
   > DEL whatsapp:session:+27123456789
   ```

### Message Delivery Failures

1. **Check Access Token** - May have expired
2. **Verify Phone Number** - Must be registered with WhatsApp Business
3. **Check Rate Limits** - Meta has rate limits per number

### Search Not Working

1. **Verify Location** - User must have set location
2. **Check H3 Service** - Hyperlocal search requires H3 data
3. **Check Product Data** - Ensure products exist in database

---

## 📊 Monitoring

### Key Metrics to Track

1. **Active Sessions**
   ```bash
   redis-cli KEYS "whatsapp:session:*" | wc -l
   ```

2. **Message Processing Rate**
   - Check logs for processing times
   - Monitor error rates

3. **Conversion Funnel**
   - Onboarding completion rate
   - Search → Cart → Checkout
   - Seller adoption rate

### Logs

Important log patterns:
- `📞 WhatsApp webhook verification request`
- `📨 WhatsApp webhook received`
- `📩 Processing message from [phone]`
- `✅ Message processed successfully`
- `❌ Message processing failed`

---

## 🔐 Security Best Practices

1. **Verify Webhook Signatures** - Always enabled in production
2. **Use Environment Variables** - Never commit secrets
3. **Rate Limiting** - Already implemented per user
4. **Validate Phone Numbers** - Prevent spam
5. **Secure Payment Links** - Use short-lived tokens

---

## 🎨 Frontend Integration

### Add WhatsApp Button to Your App

```jsx
import WhatsAppFloatingButton from './components/WhatsApp/WhatsAppFloatingButton';
import WhatsAppOnboarding from './components/WhatsApp/WhatsAppOnboarding';

function App() {
  return (
    <div>
      {/* Your app content */}
      
      {/* Always-visible WhatsApp button */}
      <WhatsAppFloatingButton />
      
      {/* Optional: Onboarding page */}
      <Route path="/whatsapp" component={WhatsAppOnboarding} />
    </div>
  );
}
```

Update the WhatsApp business number in:
- `front-end/src/components/WhatsApp/WhatsAppFloatingButton.jsx`
- `front-end/src/components/WhatsApp/WhatsAppOnboarding.jsx`

---

## 📚 Additional Resources

- [WhatsApp Business API Documentation](https://developers.facebook.com/docs/whatsapp)
- [Message Templates Guide](https://developers.facebook.com/docs/whatsapp/message-templates)
- [Interactive Messages](https://developers.facebook.com/docs/whatsapp/interactive-messages)
- [Webhook Setup](https://developers.facebook.com/docs/whatsapp/webhooks)

---

## 🤝 Support

For issues or questions:
1. Check logs in `back-end/` directory
2. Test endpoints using curl/Postman
3. Verify WhatsApp Business API status
4. Check Redis connection

---

## 📝 License

This WhatsApp integration is part of the Shopply platform.

---

**Happy Chatting! 🚀📱**

