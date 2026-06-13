import { defineConfig } from 'vite'
import { resolve } from 'path'
import AutoImport from 'unplugin-auto-import/vite'
import react from '@vitejs/plugin-react-swc'
import { analyzer } from "vite-bundle-analyzer"
import { createHtmlPlugin } from 'vite-plugin-html'
import UnoCSS from 'unocss/vite'

// https://vitejs.dev/config/
export default defineConfig(({mode}) => ({
  plugins: [
    react(),
    UnoCSS(),
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
    }),
    createHtmlPlugin({
      template: 'index.html',
      inject: {
        data: {
          isProduction: process.env.NODE_ENV === 'production'
        },
      },
    }),
    mode === "analyze" ? analyzer() : undefined
  ],
  resolve: {
    alias: {
      '~': resolve('./src/'),
      '~types': resolve('./src/types'),
      '~enums': resolve('./src/enums'),
      '~assets': resolve('./src/assets'),
      '~styles': resolve('./src/styles'),
      '~fs': resolve('./src/fs'),
      '~stores': resolve('./src/stores'),
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom']
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
        /^react-dom/,
        'luxon'
      ],
      output: {
        format: 'es',
        globals: {
          'react': 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'jsxRuntime',
          'react/jsx-dev-runtime': 'jsxDevRuntime',
          'react-dom/client': 'ReactDOMClient',
          'luxon': 'luxon'
        }
      },
    },
  }
}))
