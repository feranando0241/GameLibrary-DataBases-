import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // The app lives in frontend/; configs and node_modules stay at the repo root
  root: 'frontend',
  build: { outDir: '../dist', emptyOutDir: true },
  // Dev only: api.ts uses relative /api URLs, so forward them to the Express server.
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
})
