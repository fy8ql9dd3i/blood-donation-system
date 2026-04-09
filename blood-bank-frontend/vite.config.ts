import { defineConfig, loadEnv } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  // Backend for local dev (override with VITE_PROXY_TARGET=http://127.0.0.1:5000 in .env)
  const proxyTarget = env.VITE_PROXY_TARGET || 'http://127.0.0.1:5000'

  return {
    // Allow Create React App–style REACT_APP_* as well as VITE_* in .env files
    envPrefix: ['VITE_', 'REACT_APP_'],
    plugins: [
      react(),
      babel({ presets: [reactCompilerPreset()] })
    ],
    server: {
      proxy: {
        // Browser calls same origin /api/... → forwarded to Express (avoids CORS during npm run dev)
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
        },
      },
    },
  }
})
