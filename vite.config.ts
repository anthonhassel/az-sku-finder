import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
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
