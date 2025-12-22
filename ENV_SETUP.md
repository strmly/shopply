# Environment Variables Setup Guide

This project uses a centralized `.env` file at the root directory for all environment variables. This makes it easier to manage configuration for both the frontend and backend in production.

## Quick Start

1. **Copy the example file:**
   ```bash
   cp .env.example .env
   ```

2. **Update the values** in `.env` with your production settings

3. **Never commit** `.env` to version control (it's already in `.gitignore`)

## Environment Variables

### Application Configuration
- `NODE_ENV` - Environment mode: `development`, `production`, or `test`
- `PORT` - Backend server port (default: 5000)
- `API_VERSION` - API version (default: v1)
- `APP_URL` - Base URL of your application (e.g., `https://shopply.app`)
- `CORS_ORIGIN` - Allowed CORS origin for production

### Database Configuration
- `MONGODB_URI` - MongoDB connection string
- `DB_HOST` - Database host (for PostgreSQL/MySQL)
- `DB_PORT` - Database port
- `DB_NAME` - Database name
- `DB_USER` - Database username
- `DB_PASSWORD` - Database password

### Redis Configuration
- `REDIS_HOST` - Redis server host
- `REDIS_PORT` - Redis server port (default: 6379)
- `REDIS_PASSWORD` - Redis password (if required)
- `REDIS_DB` - Redis database number (default: 0)

### Authentication
- `JWT_SECRET` - Secret key for JWT tokens (⚠️ **CHANGE IN PRODUCTION**)
- `JWT_EXPIRES_IN` - JWT token expiration time (default: 24h)

### Logging
- `LOG_LEVEL` - Logging level: `ERROR`, `WARN`, `INFO`, `DEBUG` (default: INFO)

### WhatsApp Business API
- `WHATSAPP_API_TYPE` - API type: `cloud` or `bsp`
- `WHATSAPP_PHONE_NUMBER_ID` - WhatsApp phone number ID
- `WHATSAPP_BUSINESS_ACCOUNT_ID` - Business account ID
- `WHATSAPP_ACCESS_TOKEN` - Access token for WhatsApp API
- `WHATSAPP_API_VERSION` - API version (default: v18.0)
- `WHATSAPP_WEBHOOK_VERIFY_TOKEN` - Webhook verification token
- `WHATSAPP_WEBHOOK_SECRET` - Webhook secret
- `WHATSAPP_SESSION_TTL` - Session TTL in seconds (default: 1800)
- `WHATSAPP_PERSISTENT_TTL` - Persistent session TTL in seconds (default: 604800)
- `WHATSAPP_FLOWS_ENABLED` - Enable WhatsApp Flows (true/false)
- `FLOW_ID_ADDRESS_SETUP` - Flow ID for address setup
- `FLOW_ID_KYC` - Flow ID for KYC upload
- `FLOW_ID_PRODUCT_CREATE` - Flow ID for product creation
- `FLOW_ID_RETURNS` - Flow ID for returns request

### Frontend Configuration
- `VITE_API_BASE_URL` - API base URL for frontend (default: `/api`)
- `VITE_BACKEND_URL` - Backend URL for Vite proxy in development (default: `http://localhost:5000`)

## How It Works

### Backend
The backend server (`back-end/server.js`) loads the `.env` file from the root directory using:
```javascript
dotenv.config({ path: path.join(rootDir, '.env') });
```

### Frontend
The frontend Vite configuration (`front-end/vite.config.js`) is configured to load environment variables from the root directory:
```javascript
envDir: rootDir
```

**Important:** Only environment variables prefixed with `VITE_` are exposed to the frontend code for security reasons.

## Production Deployment

1. **Set all required variables** in your production environment
2. **Use secure values** for secrets (JWT_SECRET, database passwords, etc.)
3. **Update APP_URL** to your production domain
4. **Configure CORS_ORIGIN** to your production frontend URL
5. **Set NODE_ENV=production** for optimized performance

## Security Notes

- ⚠️ **Never commit** `.env` files to version control
- ⚠️ **Change default secrets** (especially `JWT_SECRET`)
- ⚠️ **Use strong passwords** for databases and Redis
- ⚠️ **Keep access tokens secure** and rotate them regularly
- ⚠️ **Use environment-specific** `.env` files for different environments

## Troubleshooting

### Backend can't find .env
- Ensure `.env` exists in the root directory (not in `back-end/`)
- Check that the path resolution is correct in `server.js`

### Frontend can't access environment variables
- Ensure variables are prefixed with `VITE_`
- Restart the Vite dev server after changing `.env`
- Check that `envDir` is set correctly in `vite.config.js`

### Variables not loading
- Check for syntax errors in `.env` (no spaces around `=`)
- Ensure no quotes around values (unless needed)
- Restart both frontend and backend servers after changes

