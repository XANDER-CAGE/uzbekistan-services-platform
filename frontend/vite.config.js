import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    historyApiFallback: true, // Это ключевая настройка
    port: 5173,
  },
  build: {
    outDir: 'dist',
  },
})