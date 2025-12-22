# WhatsApp Channel - Deployment Checklist ✅

Use this checklist to ensure your WhatsApp channel is properly configured and deployed.

---

## 📋 Pre-Deployment Checklist

### 1. Backend Setup

- [ ] **Dependencies installed**
  ```bash
  cd back-end && npm install
  ```
  ✅ Verify: `node_modules` contains ioredis, axios, uuid

- [ ] **Redis installed and running**
  ```bash
  redis-cli ping
  # Should return: PONG
  ```

- [ ] **Environment variables configured**
  - [ ] `.env` file created from `.env.example`
  - [ ] `WHATSAPP_PHONE_NUMBER_ID` set
  - [ ] `WHATSAPP_ACCESS_TOKEN` set
  - [ ] `WHATSAPP_WEBHOOK_VERIFY_TOKEN` set
  - [ ] `REDIS_HOST` and `REDIS_PORT` set
  - [ ] `APP_URL` set

- [ ] **Server starts without errors**
  ```bash
  npm run dev
  # Should see: ✅ WhatsApp session store ready
  ```

---

### 2. WhatsApp Business API Setup

- [ ] **Meta Business Account created**
  - [ ] Business verified
  - [ ] Payment method added

- [ ] **WhatsApp Business App created**
  - [ ] App name set
  - [ ] WhatsApp product added

- [ ] **Phone number acquired**
  - [ ] Business phone number registered
  - [ ] Phone number verified
  - [ ] Display name set

- [ ] **API credentials obtained**
  - [ ] Phone Number ID copied
  - [ ] Business Account ID copied
  - [ ] Access Token generated (permanent token for production)

- [ ] **Test numbers added** (for development)
  - [ ] Your personal number added
  - [ ] Test message sent successfully

---

### 3. Webhook Configuration

#### For Development (ngrok)

- [ ] **ngrok installed**
  ```bash
  npm install -g ngrok
  ```

- [ ] **ngrok tunnel started**
  ```bash
  ngrok http 5000
  # Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
  ```

- [ ] **Webhook configured in Meta**
  - [ ] Callback URL: `https://abc123.ngrok.io/api/whatsapp/webhook`
  - [ ] Verify Token: Matches `WHATSAPP_WEBHOOK_VERIFY_TOKEN`
  - [ ] Subscribed to `messages` field
  - [ ] Webhook verified successfully

#### For Production

- [ ] **Server deployed with HTTPS**
  - [ ] SSL certificate valid
  - [ ] Domain configured

- [ ] **Webhook configured in Meta**
  - [ ] Callback URL: `https://yourdomain.com/api/whatsapp/webhook`
  - [ ] Verify Token: Strong, secure token
  - [ ] Subscribed to `messages` field
  - [ ] Webhook verified successfully

---

### 4. Frontend Integration

- [ ] **WhatsApp business number updated**
  - [ ] In `WhatsAppFloatingButton.jsx` (line ~10)
  - [ ] In `WhatsAppOnboarding.jsx` (line ~10)

- [ ] **Components integrated**
  - [ ] `WhatsAppFloatingButton` added to `App.jsx`
  - [ ] Optional: `WhatsAppOnboarding` route created

- [ ] **Frontend built and deployed**
  ```bash
  cd front-end
  npm run build
  ```

---

### 5. Message Templates (Production)

For production, you need approved message templates:

- [ ] **OTP template submitted**
  ```
  Your verification code is {{1}}. Valid for {{2}} minutes.
  ```

- [ ] **Order confirmation template submitted**
  ```
  ✅ Order #{{1}} confirmed! Total: R{{2}}. We'll keep you updated.
  ```

- [ ] **Order status templates submitted**
  - [ ] Order Preparing
  - [ ] Order Ready
  - [ ] Courier Assigned
  - [ ] Out for Delivery
  - [ ] Delivered

- [ ] **Templates approved by Meta**
  (Can take 24-48 hours)

---

## 🧪 Testing Checklist

### 1. Local Testing (Without WhatsApp)

- [ ] **Health check works**
  ```bash
  curl http://localhost:5000/api/whatsapp/health
  # Should return: { status: "healthy" }
  ```

- [ ] **Sessions endpoint works**
  ```bash
  curl http://localhost:5000/api/whatsapp/sessions
  # Should return: { count: 0, sessions: [] }
  ```

- [ ] **Redis connection works**
  ```bash
  redis-cli KEYS "whatsapp:*"
  # Should return: (empty array) or existing keys
  ```

---

### 2. End-to-End Testing

#### Buyer Flow

- [ ] **Onboarding**
  - [ ] Send "Hi" → Receives welcome message
  - [ ] Click "Set Location" → Gets location options
  - [ ] Share location or enter address → Location saved
  - [ ] Select radius → Onboarding complete

- [ ] **Search**
  - [ ] Type "search [product]" → Gets search results
  - [ ] See tier expansion message (e.g., "Expanded to 5km")
  - [ ] Select product → Views product detail
  - [ ] See product image, price, distance

- [ ] **Cart**
  - [ ] Click "Add to Cart" → Item added
  - [ ] Type "cart" → Views cart
  - [ ] Edit quantities → Updates correctly
  - [ ] Remove item → Item removed

- [ ] **Checkout**
  - [ ] Click "Checkout" → Confirms address
  - [ ] Click "Confirm" → Gets payment link
  - [ ] Click payment link → Opens payment page
  - [ ] Complete payment → Order created

- [ ] **Orders**
  - [ ] Type "orders" → Lists orders
  - [ ] Select order → Views order detail
  - [ ] See order timeline
  - [ ] Receive status notifications

#### Seller Flow

- [ ] **Switch to Seller Mode**
  - [ ] Type "seller" → Enters seller mode
  - [ ] Sees dashboard with summary

- [ ] **Order Management**
  - [ ] Click "Orders" → Lists pending orders
  - [ ] Select order → Views order detail
  - [ ] Mark as Preparing → Status updated
  - [ ] Mark as Ready → Customer notified

- [ ] **Product Management**
  - [ ] Click "Products" → Lists products
  - [ ] Click "Add Product" → Guided flow
  - [ ] Enter name, price, stock → Product created
  - [ ] Update stock → Stock updated
  - [ ] Edit product → Changes saved

#### Global Commands

- [ ] **Navigation**
  - [ ] Type "home" → Goes to home
  - [ ] Type "back" → Goes to previous screen
  - [ ] Type "help" → Shows help

- [ ] **Mode Switching**
  - [ ] Type "seller" → Switches to seller mode
  - [ ] Type "buyer" → Switches to buyer mode

---

### 3. Error Handling Testing

- [ ] **Invalid input**
  - [ ] Send gibberish → Gets helpful error message
  - [ ] Send unsupported command → Graceful response

- [ ] **Session expiry**
  - [ ] Wait 30+ minutes → Session expires
  - [ ] Send message → New session created

- [ ] **Rate limiting**
  - [ ] Send 60+ messages in 1 minute → Rate limited
  - [ ] Wait 1 minute → Can message again

- [ ] **Network errors**
  - [ ] Stop Redis → Falls back to in-memory
  - [ ] Server restart → Sessions restore from Redis

---

## 🚀 Production Deployment Checklist

### 1. Infrastructure

- [ ] **Server provisioned**
  - [ ] Adequate CPU (2+ cores)
  - [ ] Adequate RAM (2+ GB)
  - [ ] SSD storage

- [ ] **Redis deployed**
  - [ ] Production Redis instance
  - [ ] Persistence enabled (AOF or RDB)
  - [ ] Password protected
  - [ ] Backup configured

- [ ] **Database ready**
  - [ ] PostgreSQL production instance
  - [ ] Indexes created
  - [ ] Backup configured

- [ ] **HTTPS configured**
  - [ ] SSL certificate installed
  - [ ] Domain pointing to server
  - [ ] HTTPS enforced

---

### 2. Environment Configuration

- [ ] **Production `.env` set**
  - [ ] `NODE_ENV=production`
  - [ ] Strong `WHATSAPP_WEBHOOK_SECRET`
  - [ ] Permanent `WHATSAPP_ACCESS_TOKEN`
  - [ ] Production database credentials
  - [ ] Production Redis credentials

- [ ] **Secrets secured**
  - [ ] Not committed to git
  - [ ] Stored in secure vault (AWS Secrets Manager, etc.)

---

### 3. Security Hardening

- [ ] **Webhook security**
  - [ ] Signature verification enabled
  - [ ] Strong verify token (32+ chars)
  - [ ] HTTPS only

- [ ] **Rate limiting enabled**
  - [ ] Per-user limits configured
  - [ ] Abuse prevention active

- [ ] **Sensitive data protected**
  - [ ] Environment variables not exposed
  - [ ] API keys rotated regularly
  - [ ] Access logs monitored

---

### 4. Monitoring & Logging

- [ ] **Logging configured**
  - [ ] Error logs to file/service
  - [ ] Request logs enabled
  - [ ] Structured logging format

- [ ] **Monitoring set up**
  - [ ] Uptime monitoring
  - [ ] Error rate alerts
  - [ ] Response time tracking
  - [ ] Session count monitoring

- [ ] **Alerts configured**
  - [ ] High error rate
  - [ ] Server down
  - [ ] Redis connection lost
  - [ ] High response times

---

### 5. Performance Optimization

- [ ] **Redis optimized**
  - [ ] maxmemory policy set
  - [ ] Connection pooling enabled
  - [ ] Persistence tuned

- [ ] **Database optimized**
  - [ ] Indexes on frequently queried fields
  - [ ] Connection pooling configured
  - [ ] Query performance monitored

- [ ] **Caching enabled**
  - [ ] Product data cached
  - [ ] Search results cached
  - [ ] Static assets cached

---

### 6. Backup & Recovery

- [ ] **Backup strategy**
  - [ ] Redis snapshots scheduled
  - [ ] Database backups automated
  - [ ] Backup verification tested

- [ ] **Recovery plan**
  - [ ] Restoration process documented
  - [ ] Recovery time objective defined
  - [ ] Disaster recovery tested

---

## 📊 Launch Checklist

### Pre-Launch

- [ ] **Final testing**
  - [ ] All buyer flows tested
  - [ ] All seller flows tested
  - [ ] Error scenarios tested
  - [ ] Performance tested (load testing)

- [ ] **Documentation reviewed**
  - [ ] User guide created
  - [ ] Seller guide created
  - [ ] FAQ prepared
  - [ ] Support team trained

- [ ] **Marketing prepared**
  - [ ] Launch announcement ready
  - [ ] Social media posts scheduled
  - [ ] QR codes generated
  - [ ] Website updated

### Launch Day

- [ ] **Monitor closely**
  - [ ] Watch logs in real-time
  - [ ] Monitor error rates
  - [ ] Track user adoption
  - [ ] Respond to issues quickly

- [ ] **Support ready**
  - [ ] Support team standing by
  - [ ] Escalation process clear
  - [ ] Communication channels open

### Post-Launch

- [ ] **Collect feedback**
  - [ ] User satisfaction surveys
  - [ ] Bug reports tracked
  - [ ] Feature requests logged

- [ ] **Analyze metrics**
  - [ ] User adoption rate
  - [ ] Conversion funnel
  - [ ] Most used features
  - [ ] Drop-off points

- [ ] **Optimize**
  - [ ] Fix reported bugs
  - [ ] Improve slow flows
  - [ ] Enhance UX based on feedback

---

## 🎯 Success Metrics

Track these KPIs:

### Adoption Metrics
- [ ] WhatsApp users vs. app users
- [ ] Daily/Monthly active users
- [ ] Onboarding completion rate
- [ ] Buyer vs. seller ratio

### Engagement Metrics
- [ ] Messages per user
- [ ] Session duration
- [ ] Repeat usage rate
- [ ] Feature usage distribution

### Business Metrics
- [ ] GMV via WhatsApp
- [ ] Conversion rate (search → purchase)
- [ ] Average order value
- [ ] Seller adoption rate

### Technical Metrics
- [ ] Response time (< 2s)
- [ ] Error rate (< 1%)
- [ ] Uptime (> 99.9%)
- [ ] Session creation time

---

## 🚨 Rollback Plan

If something goes wrong:

### Immediate Actions

1. **Disable webhook**
   - [ ] Remove webhook in Meta dashboard
   - [ ] Stops incoming messages

2. **Switch to maintenance mode**
   - [ ] Auto-reply with maintenance message
   - [ ] Log all incoming messages for replay

3. **Investigate issue**
   - [ ] Check logs
   - [ ] Identify root cause
   - [ ] Fix issue

4. **Test fix**
   - [ ] Test in development
   - [ ] Verify fix works
   - [ ] Deploy to production

5. **Re-enable webhook**
   - [ ] Add webhook back
   - [ ] Test with test message
   - [ ] Monitor closely

---

## 📞 Support Contacts

Keep these handy:

- **Meta Support**: https://business.facebook.com/help
- **WhatsApp Business API Docs**: https://developers.facebook.com/docs/whatsapp
- **Your Team**: [Add contact details]

---

## ✅ Final Sign-Off

Before going live, confirm:

- [ ] **Technical Lead**: All systems operational
- [ ] **Product Manager**: Features complete and tested
- [ ] **Support Lead**: Team trained and ready
- [ ] **Marketing Lead**: Launch materials ready
- [ ] **CTO/CEO**: Approval to launch

---

## 🎉 You're Ready to Launch!

Once all checkboxes are ticked, you're ready to:

1. **Enable webhook** in Meta dashboard
2. **Announce launch** to your users
3. **Monitor closely** for first 24 hours
4. **Iterate based on feedback**

**Good luck with your launch! 🚀**

---

**Pro Tip**: Keep this checklist updated as you learn from production. It's a living document!

---

Built for Shopply | Deployment Ready | 2024

