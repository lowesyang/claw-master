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
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
  server: {
    proxy: {
      // 开发环境代理（与 Vercel Edge Functions 对应）
      // ClawNews 所有请求走代理
      '/api/clawnews/proxy': {
        target: 'https://clawnews.io',
        changeOrigin: true,
        rewrite: (path) => {
          const url = new URL(path, 'http://localhost')
          return url.searchParams.get('path') || '/'
        },
      },
      // Clawnch 所有请求走代理
      '/api/clawnch/proxy': {
        target: 'https://clawn.ch',
        changeOrigin: true,
        rewrite: (path) => {
          const url = new URL(path, 'http://localhost')
          return url.searchParams.get('path') || '/'
        },
      },
    },
  },
})
