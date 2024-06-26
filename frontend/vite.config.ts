import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@assets': '/src/assets',
      '@components': '/src/components',
      '@config': '/src/config',
      '@features': '/src/features',
      '@hooks': '/src/hooks',
      '@lib': '/src/lib',
      '@providers': '/src/providers',
      '@routes': '/src/routes',
      '@stores': '/src/stores',
      '@test': '/src/test',
      '@types': '/src/types',
      '@utils': '/src/utils',
      '@root': '/src',
    },
  },
})
