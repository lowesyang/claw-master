import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      // ClawNews API 代理
      '/api/clawnews': {
        target: 'https://clawnews.io',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/clawnews/, ''),
        secure: true,
      },
      // Moltbook API 代理
      '/api/moltbook': {
        target: 'https://www.moltbook.com/api/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/moltbook/, ''),
        secure: true,
      },
      // Clawnch API 代理
      '/api/clawnch': {
        target: 'https://clawn.ch',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/clawnch/, '/api'),
        secure: true,
      },
    },
  },
})
