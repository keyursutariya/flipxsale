import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  envPrefix: ['VITE_', 'FACEBOOK_', 'META_', 'UPI_', 'RAZORPAY_', 'GOOGLE_'],
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '^/api(?!/products\\.json)': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
