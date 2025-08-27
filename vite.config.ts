import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico'],
      manifest: {
        name: '두뇌수련',
        short_name: '두뇌수련',
        description: '두뇌를 수련하십시오.',
        theme_color: '#1C1C2A',
        background_color: '#1C1C2A',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/'
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      }
    })
  ],
})
