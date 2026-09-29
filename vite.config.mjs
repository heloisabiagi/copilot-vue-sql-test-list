import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  root: 'public',
  publicDir: false,
  resolve: {
    alias: {
      vue: 'vue/dist/vue.esm-bundler.js'
    }
  },
  plugins: [vue()],
  build: {
    outDir: '../dist',
    emptyOutDir: true
  }
});