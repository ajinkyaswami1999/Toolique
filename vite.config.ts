import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Isolate heavy math & calculus computing engines
            if (id.includes('mathjs')) {
              return 'vendor-mathjs';
            }
            if (id.includes('nerdamer')) {
              return 'vendor-nerdamer';
            }
            // Isolate spreadsheet & data grid processors
            if (id.includes('xlsx')) {
              return 'vendor-xlsx';
            }
            // Isolate PDF generation & parsing engines
            if (id.includes('jspdf') || id.includes('jspdf-autotable')) {
              return 'vendor-jspdf';
            }
            if (id.includes('pdfjs-dist')) {
              return 'vendor-pdfjs';
            }
            if (id.includes('pdf-lib')) {
              return 'vendor-pdflib';
            }
            // Lazy-loaded media decoder
            if (id.includes('heic2any')) {
              return 'vendor-heic2any';
            }
          }
        },
      },
    },
    chunkSizeWarningLimit: 1600,
  },
});
