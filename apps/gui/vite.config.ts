import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    // Please make sure that '@tanstack/router-plugin' is passed before '@vitejs/plugin-react'
    TanStackRouterVite({ target: 'react', autoCodeSplitting: true }),
    react(),
  ],
  optimizeDeps: {
    esbuildOptions: { preserveSymlinks: true },
    force: true
  },
  resolve: {
    preserveSymlinks: true,
  },
  server: {
    watch: {
      followSymlinks: true
    } 
  }
})
