import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'VBWDCore',
      fileName: (format) => `index.${format === 'es' ? 'mjs' : 'cjs'}`,
      formats: ['es', 'cjs']
    },
    rollupOptions: {
      external: ['vue', 'vue-router', 'pinia', 'axios', 'zod'],
      output: {
        globals: {
          vue: 'Vue',
          'vue-router': 'VueRouter',
          pinia: 'Pinia',
          axios: 'axios',
          zod: 'zod'
        }
      }
    },
    sourcemap: true,
    minify: false // Disabled for development; enable for production builds
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
});
