import { defineConfig } from 'vite'
import { resolve } from 'path'
import react from '@vitejs/plugin-react-swc'
import cdn from 'vite-plugin-cdn-import'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    cdn({
      modules: ['react', 'react-dom'],
    })
  ],
  resolve: {
    alias: {
      '~types': resolve('./src/types'),
      '~enums': resolve('./src/enums'),
      '~assets': resolve('./src/assets'),
      '~styles': resolve('./src/styles')
    }
  }
})
