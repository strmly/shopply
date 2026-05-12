# WhatsApp Integration - Quick Start Guide 🚀

Get your WhatsApp channel up and running in 15 minutes!

## 📦 What's Been Implemented

✅ **Complete Backend Architecture**
- WhatsApp Gateway with Business API integration
- Conversation Orchestrator (state machine)
- Session Management with Redis
- Message Renderer for all WhatsApp message types
- Notification System with templates

✅ **Buyer Features**
- Onboarding with location setup
- Product search with H3 hyperlocal expansion
- Shopping cart management
- Checkout with payment links
- Order tracking
- All integrated with existing services

✅ **Seller Features**
- Seller dashboard
- Order management
- Product management
- Stock updates
- Quick commands

✅ **Frontend Components**
- WhatsApp onboarding page
- Floating WhatsApp button
- QR code integration

---

## 🚀 Getting Started (3 Steps)

### Step 1: Install Dependencies

```bash
cd back-end
npm install
```

New packages installed:
- `ioredis` - Redis client for sessions
- `axios` - HTTP requests
- `uuid` - Unique identifiers
- `joi` - Validation (if needed)

### Step 2: Start Redis

```bash
# macOS with Homebrew
brew install redis
brew services start redis

# Or using Docker
docker run -d -p 6379:6379 redis:alpine

# Verify it's running
redis-cli ping
# Should return: PONG
```

### Step 3: Start the Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

**Server will start with:**
- Main API: `http://localhost:5000`
- WhatsApp webhooks: `http://localhost:5000/api/whatsapp/webhook`
- Health check: `http://localhost:5000/api/whatsapp/health`

---

## 🧪 Test It (Without WhatsApp API)

You can test the system logic without setting up WhatsApp:

### 1. Check Health

```bash
curl http://localhost:5000/api/whatsapp/health
```

### 2. View Active Sessions

```bash
curl http://localhost:5000/api/whatsapp/sessions
```

### 3. Test Redis

```bash
redis-cli
> PING
PONG
> KEYS whatsapp:*
(empty array)
> exit
```

---

## 📱 Connect to WhatsApp (Production Ready)

### Option A: Using Meta Cloud API (Recommended)

1. **Create Meta Business Account**
   - Go to: https://business.facebook.com/
   - Create or select your business

2. **Set Up WhatsApp Business**
   - Visit: https://developers.facebook.com/
   - Create an app or select existing
   - Add "WhatsApp" product

3. **Get Your Credentials**
   ```
   Phone Number ID: Found in WhatsApp > API Setup
   Access Token: Generated in WhatsApp > API Setup
   Business Account ID: Found in settings
   ```

4. **Create `.env` File**
   ```bash
   cp .env.example .env
   ```

   Edit `.env`:
   ```env
   WHATSAPP_API_TYPE=cloud
   WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
   WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id
   WHATSAPP_ACCESS_TOKEN=your_access_token
   
   WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_secret_token_here
   WHATSAPP_WEBHOOK_SECRET=your_webhook_secret
   
   REDIS_HOST=localhost
   REDIS_PORT=6379
   ```

5. **Expose Your Server (for webhook)**
   
   **For Testing (ngrok):**
   ```bash
   # Install ngrok
   npm install -g ngrok
   
   # Start ngrok
   ngrok http 5000
   
   # Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
   ```

   **For Production:**
   - Deploy to a server with HTTPS
   - Use your domain: `https://yourdomain.com/api/whatsapp/webhook`

6. **Configure Webhook in Meta**
   - Go to WhatsApp > Configuration
   - Click "Edit" webhook
   - **Callback URL**: `https://abc123.ngrok.io/api/whatsapp/webhook`
   - **Verify Token**: Same as `WHATSAPP_WEBHOOK_VERIFY_TOKEN`
   - Subscribe to `messages`
   - Click "Verify and Save"

7. **Test It!**
   - Add test phone number in Meta dashboard
   - Send "Hi" to your WhatsApp Business number
   - You should receive the welcome message!

### Option B: Using BSP (Twilio, MessageBird, etc.)

1. Sign up with a BSP provider
2. Get API credentials
3. Update `WhatsAppGateway.js` with provider's SDK
4. Follow provider's webhook setup

---

## 💬 User Experience Flow

### For Buyers

```
User: Hi
Bot:  👋 Welcome to Str3mly ShopLocal!
      [📍 Set Location] [🔍 Start Shopping]

User: [Clicks Set Location]
Bot:  📍 Share your location or enter address
      [📲 Share Location] [✏️ Enter Address]

User: [Shares location]
Bot:  ✅ All set! You're ready to shop! 🎉
      [🔍 Search Products] [📂 Categories] [🔥 Hot Deals]

User: search braai tongs
Bot:  🔍 Searching within 1km...
      Found 6 products within 10km
      [List of products with prices and distances]

User: [Selects product]
Bot:  [Product image]
      Braai Tongs Pro - R149.99
      📍 2.3km • 20 min
      🏪 TopGear Store ⭐ 4.8
      ✅ In stock (15)
      [🛒 Add to Cart] [⚡ Buy Now]

User: [Clicks Add to Cart]
Bot:  ✅ Added to cart!
      🛒 Your Cart (1 store)
      [✅ Checkout] [✏️ Edit Cart]
```

### For Sellers

```
User: seller
Bot:  🏪 Seller Dashboard
      Today's Sales: R1,234.50
      Pending Orders: 3
      [📦 Orders] [📦 Products] [📊 Analytics]

User: [Clicks Orders]
Bot:  📦 Your Orders
      Select an order to manage:
      [List of pending orders]

User: [Selects order]
Bot:  📦 Order #1234
      Status: Confirmed
      Customer: John Doe
      Items: 2x Braai Pack
      Total: R299.00
      [👨‍🍳 Start Preparing] [💬 Contact]
```

---

## 🎨 Add to Your Frontend

### 1. Import Components

```jsx
// In your main App.jsx
import WhatsAppFloatingButton from './components/WhatsApp/WhatsAppFloatingButton';

function App() {
  return (
    <div>
      {/* Your existing app */}
      
      {/* Add this at the end */}
      <WhatsAppFloatingButton />
    </div>
  );
}
```

### 2. Create WhatsApp Page (Optional)

```jsx
// In your routing
import WhatsAppOnboarding from './components/WhatsApp/WhatsAppOnboarding';

<Route path="/whatsapp" component={WhatsAppOnboarding} />
```

### 3. Update Business Number

Edit these files with your actual WhatsApp Business number:
- `front-end/src/components/WhatsApp/WhatsAppFloatingButton.jsx`
- `front-end/src/components/WhatsApp/WhatsAppOnboarding.jsx`

Change this line:
```javascript
const whatsappBusinessNumber = '+27123456789'; // Your number here
```

---

## 🔍 How It Works

### Message Flow

```
WhatsApp User Message
    ↓
WhatsApp Business API (Meta)
    ↓
[POST] /api/whatsapp/webhook (Your Server)
    ↓
WhatsAppGateway.normalizeInboundEvent()
    ↓
WhatsAppOrchestrator.processEvent()
    ↓
[Route to Skill based on session.currentFlow]
    ↓
SearchSkill.handle() / CartSkill.handle() / etc.
    ↓
WhatsAppMessageRenderer.renderAndSend()
    ↓
WhatsAppGateway.sendMessage()
    ↓
WhatsApp Business API
    ↓
User receives response
```

### Session State

```javascript
{
  phoneNumber: "+27123456789",
  mode: "buyer", // or "seller"
  currentFlow: "SEARCH",
  step: "RESULTS",
  context: {
    query: "braai tongs",
    searchResults: [...],
    selectedProduct: {...}
  },
  backStack: [...]
}
```

Sessions are stored in Redis with 30-minute TTL.

---

## 🛠️ Key Files Created

### Backend Services
```
back-end/
├── config/
│   ├── whatsapp.js              # WhatsApp configuration
│   └── redis.js                 # Redis client
├── services/
│   ├── WhatsAppGateway.js       # WhatsApp API wrapper
│   ├── WhatsAppSessionService.js # Session management
│   ├── WhatsAppMessageRenderer.js # Message formatting
│   ├── WhatsAppOrchestrator.js  # Conversation routing
│   ├── WhatsAppNotificationService.js # Templates
│   └── skills/
│       ├── BaseSkill.js         # Base class
│       ├── OnboardingSkill.js   # New user flow
│       ├── BuyerHomeSkill.js    # Buyer home
│       ├── SearchSkill.js       # Search with H3
│       ├── CartSkill.js         # Cart management
│       ├── CheckoutSkill.js     # Checkout flow
│       ├── OrdersSkill.js       # Order tracking
│       ├── SellerHomeSkill.js   # Seller dashboard
│       ├── SellerOrdersSkill.js # Seller orders
│       ├── SellerProductsSkill.js # Product mgmt
│       ├── SellerPromosSkill.js # Promotions
│       └── HelpSkill.js         # Help
├── controllers/
│   └── WhatsAppController.js    # HTTP endpoints
└── routes/
    └── whatsappRoutes.js        # Route definitions
```

### Frontend Components
```
front-end/
└── src/
    └── components/
        └── WhatsApp/
            ├── WhatsAppOnboarding.jsx    # Onboarding page
            └── WhatsAppFloatingButton.jsx # Floating button
```

---

## 📊 Monitoring & Debugging

### View Logs

```bash
# Backend logs show all WhatsApp activity
npm run dev

# Look for:
# ✅ WhatsApp session store ready
# 📞 WhatsApp webhook verification request
# 📨 WhatsApp webhook received
# 📩 Processing message from +27...
# ✅ Message processed successfully
```

### Check Sessions

```bash
# List all active sessions
redis-cli KEYS "whatsapp:session:*"

# View a specific session
redis-cli GET "whatsapp:session:+27123456789"

# Clear a session (if stuck)
redis-cli DEL "whatsapp:session:+27123456789"
```

### Test Endpoints

```bash
# Health check
curl http://localhost:5000/api/whatsapp/health

# Active sessions
curl http://localhost:5000/api/whatsapp/sessions

# Send test message (admin)
curl -X POST http://localhost:5000/api/whatsapp/send-message \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+27123456789", "text": "Test"}'
```

---

## 🚨 Troubleshooting

### "Redis connection error"
```bash
# Start Redis
brew services start redis
# Or
docker run -d -p 6379:6379 redis:alpine
```

### "Webhook verification failed"
- Check `WHATSAPP_WEBHOOK_VERIFY_TOKEN` matches Meta dashboard
- Ensure webhook URL is accessible

### "Messages not received"
- Check ngrok is running
- Verify webhook URL in Meta dashboard
- Check backend logs for errors

### "Session expired"
- Sessions expire after 30 minutes of inactivity
- User should type "home" to restart

---

## 🎯 Next Steps

1. ✅ **You're Done!** - Core implementation is complete
2. **Customize** - Update welcome messages, add more skills
3. **Template Approval** - Submit message templates to Meta
4. **Deploy** - Move to production with HTTPS
5. **Monitor** - Track usage and optimize flows

---

## 📚 Additional Documentation

- Full guide: `WHATSAPP_INTEGRATION_GUIDE.md`
- Architecture details in each service file
- API documentation: https://developers.facebook.com/docs/whatsapp

---

## 🎉 You're Ready!

Your Tsenga app now has a fully functional WhatsApp channel!

**Test it:**
1. Start Redis: `redis-server`
2. Start backend: `npm run dev`
3. Use ngrok: `ngrok http 5000`
4. Configure webhook in Meta
5. Send "Hi" to your WhatsApp Business number
6. Start shopping! 🛍️

---

**Questions?** Check the logs, test the endpoints, and refer to the full guide.

**Happy Chatting! 💬🚀**

