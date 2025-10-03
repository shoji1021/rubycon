import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        nested1: resolve(__dirname, 'level1.html'),
        nested2: resolve(__dirname, 'level2.html'),
        nested3: resolve(__dirname, 'level3.html'),
        nested4: resolve(__dirname, 'level4.html'),
        nested5: resolve(__dirname, 'level5.html'),
      },
    },
  },
})