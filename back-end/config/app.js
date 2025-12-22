/**
 * Application Configuration
 */
export const appConfig = {
  port: process.env.PORT || 5000,
  env: process.env.NODE_ENV || 'development',
  apiVersion: process.env.API_VERSION || 'v1',
  
  // CORS Configuration
  cors: {
    origin: process.env.CORS_ORIGIN || (process.env.NODE_ENV === 'development' 
      ? /^http:\/\/localhost:\d+$/  // Allow any localhost port in development
      : 'http://localhost:3000'),
    credentials: true,
  },
  
  // JWT Configuration (if using authentication)
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
  
  // Rate Limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  },
};











