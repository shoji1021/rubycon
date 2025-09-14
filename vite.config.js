import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        nested: resolve(__dirname, 'nested/index.html'),
        nested: resolve(__dirname, 'nested/index2.html'),
        nested: resolve(__dirname, 'nested/index3.html'),
        nested: resolve(__dirname, 'nested/index4.html'),
        nested: resolve(__dirname, 'nested/index5.html'),
        nested: resolve(__dirname, 'nested/index6.html'),
        nested: resolve(__dirname, 'nested/index7.html'),
        nested: resolve(__dirname, 'nested/index8.html'),
        nested: resolve(__dirname, 'nested/index9.html'),
        nested: resolve(__dirname, 'nested/index10.html'),
      },
    },
  },
})