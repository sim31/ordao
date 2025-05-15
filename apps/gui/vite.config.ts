import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import { ngrok } from 'vite-plugin-ngrok'


// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const { VITE_NGROK, VITE_NGROK_AUTH_TOKEN, VITE_NGROK_DOMAIN } = loadEnv(mode, process.cwd());
  const plugins = () => {
    const pl = [
      // Please make sure that '@tanstack/router-plugin' is passed before '@vitejs/plugin-react'
      TanStackRouterVite({ target: 'react', autoCodeSplitting: true }),
      react(),
    ]
    if (VITE_NGROK === 'true') {
      console.log("Using ngrok");
      pl.push(ngrok({
        authtoken: VITE_NGROK_AUTH_TOKEN,
        domain: VITE_NGROK_DOMAIN
      }))
    } else {
      console.log("Not using ngrok");
    }
    return pl
  }

  return {
    plugins: plugins(),
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
      },
      allowedHosts: VITE_NGROK === 'true' ? [VITE_NGROK_DOMAIN] : undefined
    }
  }
})
