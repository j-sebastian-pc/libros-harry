import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      external: ['react-toastify', 'axios'], // Agregar 'axios' a la lista de externos
    },
  },
});
