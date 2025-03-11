import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      "localhost", // Разрешаем локальный доступ
      "myfrontend.loca.lt", // Разрешаем ваш туннель
    ],
  },
});
