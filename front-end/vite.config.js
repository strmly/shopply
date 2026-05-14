import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

// Get root directory (one level up from front-end/vite.config.js)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file from root directory
  const env = loadEnv(mode, rootDir, '')
  
  return {
    plugins: [react()],
    optimizeDeps: {
      include: ['socket.io-client'],
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@config': path.resolve(__dirname, './src/config'),
      },
    },
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: env.VITE_BACKEND_URL || 'http://localhost:5000',
          changeOrigin: true,
        },
        '/uploads': {
          target: env.VITE_BACKEND_URL || 'http://localhost:5000',
          changeOrigin: true,
        },
      }
    },
    envDir: rootDir, // Tell Vite to look for .env in root directory
  }
})











