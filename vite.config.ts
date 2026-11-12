import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages serves the site at /Enigma-Simulator/
export default defineConfig({
  base: '/Enigma-Simulator/',
  plugins: [react()],
});
