import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/az-sku-finder/',
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/api/retail': {
        target: 'https://prices.azure.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
