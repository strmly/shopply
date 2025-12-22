/**
 * API Configuration
 * Centralized API base URL configuration
 * 
 * In development:
 * - Uses '/api' which goes through Vite proxy to avoid CORS
 * - Vite proxy configured in vite.config.js to forward to http://localhost:5000
 * 
 * In production:
 * - Set VITE_API_BASE_URL environment variable
 * - Falls back to '/api' which should be handled by your server/reverse proxy
 */

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export default API_BASE_URL;

