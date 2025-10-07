import path from 'path'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  loadEnv(mode, process.cwd(), '') // chỉ để Vite nạp env, không cần define thủ công

  return {
    base: './',      // ⭐ bắt buộc để tránh trắng trang
    server: { port: 3000, host: '0.0.0.0' },
    plugins: [react()],
    resolve: { alias: { '@': path.resolve(__dirname, './') } },
  }
})
