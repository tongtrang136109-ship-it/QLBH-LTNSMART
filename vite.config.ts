import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/', // Quan trọng cho Netlify SPA

  server: {
    port: 3000,
    host: '0.0.0.0',
  },

  define: {
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
    'process.env.GEMINI_API_KEY': JSON.stringify(process.env.GEMINI_API_KEY),
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})
