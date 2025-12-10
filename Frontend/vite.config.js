import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,                 // bind to 0.0.0.0
    port: 5173,                 // your dev port
    cors: true,
    origin: `https://c20034db902e.ngrok-free.app`, // set origin to ngrok https url
    hmr: {
      protocol: 'wss',
      host: 'c20034db902e.ngrok-free.app',
      clientPort: 443,
    },
  }
})
