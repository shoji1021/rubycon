import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        nested1: resolve(__dirname, 'nested/index.html'),
        nested2: resolve(__dirname, 'nested/index2.html'),
        nested3: resolve(__dirname, 'nested/index3.html'),
        nested4: resolve(__dirname, 'nested/index4.html'),
        nested5: resolve(__dirname, 'nested/index5.html'),
        nested6: resolve(__dirname, 'nested/index6.html'),
        nested7: resolve(__dirname, 'nested/index7.html'),
        nested8: resolve(__dirname, 'nested/index8.html'),
        nested9: resolve(__dirname, 'nested/index9.html'),
        nested10: resolve(__dirname, 'nested/index10.html'),
      },
    },
  },
})