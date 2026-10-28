import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    watch: {
      ignored: ['**/turfington_db.json', '**/turfington_db*.json', '**/server.js', '**/*.json']
    }
  }
})
