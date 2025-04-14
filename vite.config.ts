import { defineConfig } from 'vite'
import { resolve } from 'path'
import react from '@vitejs/plugin-react-swc'
import AutoImport from 'unplugin-auto-import/vite'
import cdn from 'vite-plugin-cdn-import'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    AutoImport({
      include: [/\.[tj]sx?$/],
      imports: ['react', 'react-i18next', 'ahooks'],
      eslintrc: {
        enabled: true
      }
    }),
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
