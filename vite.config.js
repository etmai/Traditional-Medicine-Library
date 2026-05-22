import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Lắng nghe trên mọi địa chỉ IP (0.0.0.0)
    port: 3001, // Chọn cổng 3001
    strictPort: false, // Tự động chọn cổng khác nếu 3001 bị chiếm
  }
})
