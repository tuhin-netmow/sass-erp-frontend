import { defineConfig } from 'vite'
// Force Vite Config Reload
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from "path"


// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          ['babel-plugin-react-compiler'],

        ],
      },
    }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: ['leaflet', 'react-leaflet'],
  },
  // Server configuration for subdomain support
  server: {
    host: true, // Expose server to network (required for subdomain testing)
    port: 5173,
    // Allow all lvh.me subdomains for multi-tenant testing
    allowedHosts: ['.lvh.me', 'localhost', '127.0.0.1', '.localhost']
  },
})


