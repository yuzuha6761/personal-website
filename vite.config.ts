import { defineConfig } from 'vite'
import { resolve } from 'path'
import AutoImport from 'unplugin-auto-import/vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    AutoImport({
      include: [/\.[tj]sx?$/],
      imports: [
        'react',
        'react-i18next',
        'ahooks'
      ],
      eslintrc: {
        enabled: true
      }
    })
  ],
  resolve: {
    alias: {
      '~types': resolve('./src/types'),
      '~enums': resolve('./src/enums'),
      '~assets': resolve('./src/assets'),
      '~styles': resolve('./src/styles')
    }
  },
  optimizeDeps: {
    exclude: ['react', 'react-dom']
  },
  build: {
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'react/jsx-dev-runtime',
        'react-dom/client',
        /^react/,
        /^react-dom/
      ],
      output: {
        format: 'es',
        globals: {
          'react': 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'jsxRuntime',
          'react/jsx-dev-runtime': 'jsxDevRuntime',
          'react-dom/client': 'ReactDOMClient'
        },
      },
    }
  }
})
