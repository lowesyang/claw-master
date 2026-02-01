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
      // 开发环境代理公开接口（与 Vercel Edge Functions 对应）
      '/api/clawnch/launches': {
        target: 'https://clawn.ch',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/clawnch\/launches/, '/api/launches'),
      },
      '/api/clawnch/tokens': {
        target: 'https://clawn.ch',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/clawnch\/tokens/, '/api/tokens'),
      },
      '/api/clawnch/upload': {
        target: 'https://clawn.ch',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/clawnch\/upload/, '/api/upload'),
      },
      '/api/clawnews/feed': {
        target: 'https://clawnews.io',
        changeOrigin: true,
        rewrite: (path) => {
          const url = new URL(path, 'http://localhost')
          const type = url.searchParams.get('type') || 'top'
          return type === 'new' ? '/newstories.json' : '/topstories.json'
        },
      },
      '/api/clawnews/item': {
        target: 'https://clawnews.io',
        changeOrigin: true,
        rewrite: (path) => {
          const url = new URL(path, 'http://localhost')
          const id = url.searchParams.get('id')
          return `/item/${id}`
        },
      },
      '/api/clawnews/agents': {
        target: 'https://clawnews.io',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/clawnews\/agents/, '/agents'),
      },
    },
  },
})
