import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import { ngrok } from 'vite-plugin-ngrok'
import checker from 'vite-plugin-checker'


// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const { NGROK, NGROK_AUTH_TOKEN, NGROK_DOMAIN } = loadEnv(mode, process.cwd(), '');
  const plugins = () => {
    const pl = [
      // Please make sure that '@tanstack/router-plugin' is passed before '@vitejs/plugin-react'
      TanStackRouterVite({ target: 'react', autoCodeSplitting: true }),
      react(),
      checker({
        typescript: true,
      }),
    ]
    if (NGROK === 'true' && NGROK_AUTH_TOKEN) {
      console.log("Using ngrok");
      pl.push(ngrok({
        authtoken: NGROK_AUTH_TOKEN,
        domain: NGROK_DOMAIN
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
      allowedHosts: NGROK === 'true' && NGROK_DOMAIN ? [NGROK_DOMAIN] : undefined
    }
  }
})
