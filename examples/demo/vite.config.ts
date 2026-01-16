import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  // Base path for GitHub Pages deployment
  base: process.env.GITHUB_PAGES ? '/vue-desktop/demo/' : '/',
  resolve: {
    alias: {
      '@kiwiproject/vue-desktop': path.resolve(__dirname, '../../src')
    }
  }
})
