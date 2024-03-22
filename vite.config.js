import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import path from 'path'


const resolvePath = (src) => path.resolve(__dirname, src)


export default defineConfig({
  resolve: {
    alias: {
      '@': resolvePath('./src'),
    }
  },
  plugins: [vue(), vueJsx()],
})
