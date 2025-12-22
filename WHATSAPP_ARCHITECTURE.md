# WhatsApp Channel - System Architecture

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER DEVICES                             │
│  📱 WhatsApp (iOS)  📱 WhatsApp (Android)  💻 WhatsApp Web      │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    WhatsApp Business API                         │
│                        (Meta Cloud API)                          │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ HTTPS Webhook
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SHOPPLY BACKEND                             │
│                                                                   │
│  ┌────────────────────────────────────────────────────────┐    │
│  │         WhatsApp Gateway (Entry Point)                  │    │
│  │  • Webhook handler                                      │    │
│  │  • Signature verification                               │    │
│  │  • Event normalization                                  │    │
│  │  • Message sending                                      │    │
│  └──────────────────────────┬──────────────────────────────┘    │
│                             │                                     │
│                             ▼                                     │
│  ┌────────────────────────────────────────────────────────┐    │
│  │      Conversation Orchestrator (Bot Brain)              │    │
│  │  • State machine                                        │    │
│  │  • Global command routing                               │    │
│  │  • Skill routing                                        │    │
│  │  • Error handling                                       │    │
│  └──────────────────────────┬──────────────────────────────┘    │
│                             │                                     │
│              ┌──────────────┼──────────────┐                    │
│              │              │              │                     │
│              ▼              ▼              ▼                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │  Session    │  │   Message   │  │Notification │            │
│  │  Service    │  │  Renderer   │  │  Service    │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
│        │                                   │                     │
│        ▼                                   ▼                     │
│  ┌─────────┐                    ┌──────────────────┐           │
│  │  Redis  │                    │  WhatsApp API    │           │
│  └─────────┘                    └──────────────────┘           │
│                                                                   │
│  ┌────────────────────────────────────────────────────────┐    │
│  │                    SKILLS LAYER                         │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐            │    │
│  │  │Onboarding│  │  Search  │  │   Cart   │  ...        │    │
│  │  └──────────┘  └──────────┘  └──────────┘            │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐            │    │
│  │  │ Checkout │  │  Orders  │  │  Seller  │  ...        │    │
│  │  └──────────┘  └──────────┘  └──────────┘            │    │
│  └────────────────────┬───────────────────────────────────┘    │
│                       │                                          │
│                       ▼                                          │
│  ┌────────────────────────────────────────────────────────┐    │
│  │              DOMAIN SERVICES LAYER                      │    │
│  │  • Hyperlocal Search (H3)  • Product Service           │    │
│  │  • Cart Service            • Checkout Service          │    │
│  │  • Order Service           • Seller Service            │    │
│  │  • Analytics Service       • Inventory Service         │    │
│  └────────────────────┬───────────────────────────────────┘    │
│                       │                                          │
│                       ▼                                          │
│  ┌────────────────────────────────────────────────────────┐    │
│  │                   DATABASE LAYER                        │    │
│  │  • PostgreSQL (Products, Orders, Users)                │    │
│  │  • H3 Geospatial Indexes                               │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Message Flow Diagram

### Inbound Message Flow

```
User sends "search braai tongs"
         │
         ▼
┌────────────────────────┐
│  WhatsApp Business API │
└────────┬───────────────┘
         │ POST /webhook
         ▼
┌────────────────────────┐
│  WhatsAppController    │ ◄── Verify signature
└────────┬───────────────┘
         │
         ▼
┌────────────────────────┐
│  WhatsAppGateway       │ ◄── Normalize payload
│  .normalizeInbound()   │     into ChannelEvent
└────────┬───────────────┘
         │
         ▼
┌────────────────────────┐
│ WhatsAppOrchestrator   │ ◄── Check idempotency
│ .processEvent()        │     Rate limiting
└────────┬───────────────┘
         │
         ├─► Get/Create Session
         │   (WhatsAppSessionService)
         │
         ├─► Check Global Commands
         │   (home, search, cart, etc.)
         │
         ▼
┌────────────────────────┐
│   Route to Skill       │
│   (SearchSkill)        │
└────────┬───────────────┘
         │
         ├─► Load session context
         │
         ├─► Call Domain Services
         │   (HyperlocalSearchService)
         │
         ├─► Update session state
         │
         ▼
┌────────────────────────┐
│   Generate Response    │
│   (SearchSkill.handle) │
└────────┬───────────────┘
         │
         ▼
┌────────────────────────┐
│ WhatsAppMessageRenderer│ ◄── Format response
│ .renderAndSend()       │     into WhatsApp msg
└────────┬───────────────┘
         │
         ▼
┌────────────────────────┐
│  WhatsAppGateway       │ ◄── Send via API
│  .sendMessage()        │
└────────┬───────────────┘
         │
         ▼
┌────────────────────────┐
│  WhatsApp Business API │
└────────┬───────────────┘
         │
         ▼
     User receives response
```

---

## 🧩 Component Details

### 1. WhatsApp Gateway

**Responsibilities:**
- Receive and verify webhooks
- Normalize WhatsApp payloads
- Send messages via WhatsApp API
- Handle all message types

**Key Methods:**
```javascript
normalizeInboundEvent(webhookPayload) → ChannelEvent
sendTextMessage(phoneNumber, text)
sendButtonMessage(phoneNumber, text, buttons)
sendListMessage(phoneNumber, text, buttonText, sections)
sendTemplate(phoneNumber, templateName, components)
```

---

### 2. Session Service

**Responsibilities:**
- Manage conversation state
- Store in Redis with TTL
- Link WhatsApp numbers to users
- Idempotency tracking
- Rate limiting

**Session Structure:**
```javascript
{
  sessionId: "uuid",
  phoneNumber: "+27...",
  mode: "buyer" | "seller",
  currentFlow: "SEARCH",
  step: "RESULTS",
  context: {
    query: "braai tongs",
    searchResults: [...],
    selectedProduct: {...}
  },
  backStack: [...],
  lastActivity: 1234567890
}
```

---

### 3. Conversation Orchestrator

**Responsibilities:**
- Route messages to skills
- Handle global commands
- Manage conversation flow
- Error recovery

**Routing Logic:**
```javascript
if (isGlobalCommand) {
  handleGlobalCommand()
} else {
  skill = getSkill(session.currentFlow)
  response = skill.handle(event, session)
  sendResponse(response)
}
```

---

### 4. Skills Layer

Each skill handles a specific conversation flow:

| Skill | Flow | Responsibilities |
|-------|------|------------------|
| OnboardingSkill | New user setup | Location, preferences |
| BuyerHomeSkill | Home menu | Navigation, featured items |
| SearchSkill | Product search | H3 search, results, product detail |
| CartSkill | Shopping cart | Add, remove, update quantities |
| CheckoutSkill | Purchase | Address, payment link |
| OrdersSkill | Order tracking | List, detail, track |
| SellerHomeSkill | Seller dashboard | Summary, navigation |
| SellerOrdersSkill | Seller orders | Manage, update status |
| SellerProductsSkill | Products | Add, edit, stock |
| HelpSkill | Support | Help commands |

---

### 5. Message Renderer

**Responsibilities:**
- Format responses into WhatsApp message types
- Add global navigation buttons
- Handle product cards, order summaries
- Format hyperlocal tier information

**Message Types:**
```javascript
text         → Simple text message
buttons      → Up to 3 buttons
list         → Scrollable list with sections
product_card → Product with image, price, distance
cart_summary → Cart with store grouping
order_summary → Order with timeline
cta_url      → Button with external link
```

---

### 6. Notification Service

**Responsibilities:**
- Send template-based notifications
- Order lifecycle events
- Seller alerts
- OTP delivery

**Templates:**
- Order Confirmed
- Payment Received
- Order Preparing
- Order Ready
- Courier Assigned
- Out for Delivery
- Delivered
- Refund Approved/Paid
- Low Stock Alert
- Promo Starting

---

## 📊 Data Flow Diagrams

### Search Flow (with H3 Expansion)

```
User: "search braai tongs"
         │
         ▼
   SearchSkill
         │
         ├─► Get user location (lat/lng)
         │
         ├─► Call HyperlocalSearchService.searchWithExpansion()
         │        │
         │        ├─► Start with T0 (1km)
         │        │   No results → Expand to T1 (5km)
         │        │   Found 6 products!
         │        │
         │        └─► Return: {
         │              results: [...],
         │              tierUsed: T1,
         │              expanded: true
         │            }
         │
         ├─► Format results with tier info
         │   "🔍 Expanded search to 5km
         │    Found 6 products"
         │
         └─► Send list message with products
```

### Cart Flow

```
User: "Add to Cart"
         │
         ▼
   CartSkill
         │
         ├─► CartService.addItem(productId, quantity)
         │        │
         │        ├─► Validate product exists
         │        ├─► Check stock
         │        ├─► Add to cart
         │        └─► Calculate totals
         │
         ├─► Update session context
         │
         └─► Send cart summary
             "✅ Added to cart!
              🛒 Your Cart (1 store)
              Total: R149.99
              [Checkout] [Edit Cart]"
```

### Checkout Flow

```
User: "Checkout"
         │
         ▼
  CheckoutSkill
         │
         ├─► Get cart (CartService)
         ├─► Get address (AddressService)
         │
         ├─► Confirm address & summary
         │   User clicks "Confirm"
         │
         ├─► CheckoutService.createOrder()
         │        │
         │        ├─► Create order record
         │        ├─► Reserve inventory
         │        └─► Return order
         │
         ├─► Generate payment link
         │   (PaymentGateway integration)
         │
         └─► Send CTA URL button
             "💳 Complete Payment
              [Pay Now - Opens secure link]"
```

---

## 🔐 Security Architecture

### Webhook Security

```
WhatsApp → Your Server
         │
         ├─► Verify signature (HMAC-SHA256)
         │   Using WHATSAPP_WEBHOOK_SECRET
         │
         ├─► Check timestamp (prevent replay)
         │
         └─► Process if valid
```

### Session Security

```
Session Creation
         │
         ├─► Generate unique session ID
         ├─► Store in Redis with TTL (30 min)
         ├─► Track last activity
         │
Session Access
         │
         ├─► Check idle timeout
         ├─► Validate session exists
         └─► Refresh TTL on activity
```

### Rate Limiting

```
Per User:
├─► 60 messages per minute
├─► 100 searches per hour
└─► 1000 messages per day

Implemented in Redis:
├─► Increment counter
├─► Set expiry on key
└─► Check threshold
```

---

## 🔄 State Machine

### Buyer State Machine

```
ONBOARDING
    │
    ├─► WELCOME
    ├─► LOCATION_CHOICE
    ├─► LOCATION_INPUT
    ├─► CONFIRM_LOCATION
    └─► COMPLETE → BUYER_HOME
              │
              ├─► INITIAL
              │
              ├─────→ SEARCH
              │         │
              │         ├─► QUERY
              │         ├─► RESULTS
              │         ├─► PRODUCT_DETAIL
              │         └─► CHANGE_RADIUS
              │
              ├─────→ CART
              │         │
              │         ├─► VIEW
              │         ├─► ADD_ITEM
              │         ├─► EDIT
              │         └─► UPDATE_QUANTITY
              │
              ├─────→ CHECKOUT
              │         │
              │         ├─► PREPARE
              │         ├─► CONFIRM_ADDRESS
              │         └─► PAYMENT
              │
              └─────→ ORDERS
                        │
                        ├─► LIST
                        ├─► DETAIL
                        └─► TRACK
```

### Seller State Machine

```
SELLER_HOME
    │
    ├─────→ SELLER_ORDERS
    │         │
    │         ├─► LIST
    │         ├─► DETAIL
    │         └─► UPDATE_STATUS
    │
    ├─────→ SELLER_PRODUCTS
    │         │
    │         ├─► LIST
    │         ├─► ADD
    │         ├─► EDIT
    │         └─► UPDATE_STOCK
    │
    └─────→ SELLER_PROMOS
              │
              └─► (Coming soon)
```

---

## 📦 Data Models

### ChannelEvent (Internal Format)

```javascript
{
  channel: "whatsapp",
  eventId: "entry_id_message_id",
  messageId: "wamid.xxx",
  timestamp: 1234567890,
  userChannelId: "+27123456789",
  userName: "John Doe",
  type: "text|button|list|location|image",
  payload: {
    text: "search braai tongs"
    // or
    id: "product_123",
    title: "Braai Tongs"
    // or
    latitude: -26.2041,
    longitude: 28.0473
  },
  context: {
    messageId: "replied_message_id",
    from: "+27..."
  }
}
```

### WhatsApp Message Types

```javascript
// Text Message
{
  messaging_product: "whatsapp",
  to: "+27...",
  type: "text",
  text: { body: "Hello!" }
}

// Button Message
{
  type: "interactive",
  interactive: {
    type: "button",
    body: { text: "Choose an option:" },
    action: {
      buttons: [
        { type: "reply", reply: { id: "btn_1", title: "Option 1" } },
        { type: "reply", reply: { id: "btn_2", title: "Option 2" } }
      ]
    }
  }
}

// List Message
{
  type: "interactive",
  interactive: {
    type: "list",
    body: { text: "Select a product:" },
    action: {
      button: "View Products",
      sections: [
        {
          title: "Products",
          rows: [
            { id: "p1", title: "Product 1", description: "R99.99" }
          ]
        }
      ]
    }
  }
}
```

---

## 🔌 Integration Points

### With Existing Services

```
WhatsApp Skills
    │
    ├─► HyperlocalSearchService
    │   └─► Uses same H3 logic as app
    │
    ├─► ProductService
    │   └─► Same product catalog
    │
    ├─► CartService
    │   └─► Shared cart logic
    │
    ├─► CheckoutService
    │   └─► Same checkout flow
    │
    ├─► OrdersService
    │   └─► Shared order management
    │
    ├─► SellerService
    │   └─► Same seller data
    │
    └─► AnalyticsService
        └─► Unified analytics
```

**No changes needed to existing services!**

---

## 🚀 Deployment Architecture

### Development

```
Laptop/Dev Machine
    │
    ├─► Node.js Server (localhost:5000)
    ├─► Redis (localhost:6379)
    └─► ngrok (public HTTPS tunnel)
         │
         └─► Webhook: https://abc123.ngrok.io/api/whatsapp/webhook
```

### Production

```
Load Balancer (HTTPS)
    │
    ├─► App Server 1 ─┐
    ├─► App Server 2 ─┼─► Redis Cluster
    └─► App Server 3 ─┘
         │
         ├─► PostgreSQL (Primary/Replica)
         └─► S3 (Media storage)
```

---

## 📈 Scalability Considerations

### Horizontal Scaling

- **Stateless app servers** - Session in Redis
- **Load balancer** - Distribute webhooks
- **Redis cluster** - High availability

### Vertical Scaling

- **Redis memory** - More concurrent sessions
- **Database** - Handle more products/orders
- **CPU** - Faster message processing

### Performance Optimization

- **Caching** - Product data, search results
- **Async processing** - Background jobs
- **CDN** - Product images
- **Connection pooling** - Database connections

---

## 🎯 Summary

This architecture provides:

✅ **Separation of Concerns** - Each layer has clear responsibility  
✅ **Extensibility** - Easy to add new skills/features  
✅ **Reliability** - Error handling at every layer  
✅ **Security** - Verification, rate limiting, session management  
✅ **Scalability** - Stateless design, Redis clustering  
✅ **Maintainability** - Clean code, well documented  
✅ **Integration** - Uses existing services unchanged  

**Channel architecture implemented correctly! 🎉**

---

Built for Shopply | Production-Ready | 2024

