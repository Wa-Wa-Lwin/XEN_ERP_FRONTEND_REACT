import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
// import heroui from "@heroui/vite"; // 👈 add this

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()], // , heroui()
  base: "/",
  resolve: {
    alias: {
      "@api": "/src/api",
      "@assets": "/src/assets",
      "@config/*": "src/config/*", 
      "@components": "/src/components",
      "@constants": "/src/constants",
      "@context": "/src/context",
      "@features": "/src/features",
      "@hooks": "/src/hooks",
      "@redux": "/src/redux",
      "@routers": "/src/routers",
      "@services": "/src/services",
      "@styles": "/src/styles",
      "@types": "/src/types",
      "@utils": "/src/utils",
      "@locales": "/src/locales",
      "@pages": "/src/pages",
      "@": "/src",
    },
  },
  server: {
    watch: {
      usePolling: true,
    },
    host: true,
    port: 5173,
    strictPort: false,
  },
  build: {
    target: "esnext",
  },
  esbuild: {
    logOverride: { "ts-check": "silent" },
  },
  publicDir: "public",
})
