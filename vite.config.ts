import { resolve } from 'node:path'
import { defineConfig } from 'vite'

// in order to trigger ssr server restart
export default defineConfig({
  resolve: {
    alias: {
      vue: resolve(__dirname, 'node_modules/vue'),
    },
  },
  ssr: {
    external: ['vue'],
  },
})
